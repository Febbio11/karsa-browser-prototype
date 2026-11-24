export interface ParsedUrlSecurity {
  rawUrl: string;
  protocol: string;
  hostname: string;
  subdomain: string;
  primaryDomain: string;
  rest: string;
  isInternal: boolean;
  isPunycode: boolean;
  isNonHttps: boolean;
  isLoginLikePath: boolean;
  isSuspicious: boolean;
  shortBadge: string | null;
  warningReason: string | null;
}

const MULTI_PART_TLDS = new Set([
  'co.id',
  'ac.id',
  'go.id',
  'or.id',
  'web.id',
  'co.uk',
  'org.uk',
  'com.au',
  'co.jp',
  'com.sg',
  'com.my',
  'com.br',
]);

const LOGIN_PATH_REGEX = /\/(login|signin|sign-in|auth|oauth|authorize|connect|wallet|claim|verify|seed)/i;

function isLoopbackHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

function hasSuspiciousUnicode(host: string): boolean {
  // Non-ASCII characters in domain (IDN homograph risk, e.g., Cyrillic/Greek lookalikes)
  return /[^\x20-\x7E]/.test(host);
}

export function parseUrlSecurity(rawUrl: string): ParsedUrlSecurity {
  const trimmed = (rawUrl || '').trim();
  if (
    !trimmed ||
    trimmed.startsWith('karsa://') ||
    trimmed.startsWith('chrome-extension://')
  ) {
    return {
      rawUrl: trimmed,
      protocol: trimmed.split('://')[0] || 'karsa',
      hostname: trimmed,
      subdomain: '',
      primaryDomain: trimmed,
      rest: '',
      isInternal: true,
      isPunycode: false,
      isNonHttps: false,
      isLoginLikePath: false,
      isSuspicious: false,
      shortBadge: null,
      warningReason: null,
    };
  }

  let parsed: URL | null = null;
  try {
    parsed = new URL(trimmed);
  } catch {
    try {
      parsed = new URL(`https://${trimmed}`);
    } catch {
      parsed = null;
    }
  }

  if (!parsed) {
    return {
      rawUrl: trimmed,
      protocol: 'https',
      hostname: trimmed,
      subdomain: '',
      primaryDomain: trimmed,
      rest: '',
      isInternal: false,
      isPunycode: trimmed.toLowerCase().includes('xn--') || hasSuspiciousUnicode(trimmed),
      isNonHttps: trimmed.toLowerCase().startsWith('http://'),
      isLoginLikePath: LOGIN_PATH_REGEX.test(trimmed),
      isSuspicious:
        trimmed.toLowerCase().includes('xn--') ||
        hasSuspiciousUnicode(trimmed) ||
        trimmed.toLowerCase().startsWith('http://'),
      shortBadge: trimmed.toLowerCase().includes('xn--') ? 'PUNYCODE' : 'TIDAK AMAN',
      warningReason: 'URL tidak standar atau berpotensi spoofing domain.',
    };
  }

  const protocol = parsed.protocol.replace(':', '').toLowerCase();
  const hostname = parsed.hostname.toLowerCase();
  const portPart = parsed.port ? `:${parsed.port}` : '';
  const pathPart = parsed.pathname === '/' && !parsed.search && !parsed.hash ? '' : parsed.pathname;
  const rest = `${portPart}${pathPart}${parsed.search}${parsed.hash}`;

  // Split hostname into subdomain + primary registrable domain (eTLD+1)
  let subdomain = '';
  let primaryDomain = hostname;
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith('[');
  if (!isIp && hostname.includes('.')) {
    const labels = hostname.split('.').filter(Boolean);
    if (labels.length >= 2) {
      const lastTwo = `${labels[labels.length - 2]}.${labels[labels.length - 1]}`;
      const takeCount = MULTI_PART_TLDS.has(lastTwo) && labels.length >= 3 ? 3 : 2;
      primaryDomain = labels.slice(-takeCount).join('.');
      const subParts = labels.slice(0, labels.length - takeCount);
      subdomain = subParts.length > 0 ? `${subParts.join('.')}.` : '';
    }
  }

  const rawHostFromInput = trimmed
    .replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '')
    .split(/[/?#]/)[0];

  const isPunycode =
    hostname.split('.').some((label) => label.startsWith('xn--')) ||
    hasSuspiciousUnicode(rawHostFromInput);
  const isNonHttps = protocol === 'http' && !isLoopbackHost(hostname);
  const isLoginLikePath =
    LOGIN_PATH_REGEX.test(`${parsed.pathname}${parsed.search}`) ||
    /^(login|signin|auth|wallet|claim)\./i.test(hostname);

  let warningReason: string | null = null;
  let shortBadge: string | null = null;

  if (isPunycode) {
    shortBadge = 'PUNYCODE';
    warningReason =
      'Terdeteksi karakter Unicode / Punycode (xn--) pada domain. Waspada serangan phishing domain tiruan (IDN homograph).';
  } else if (isNonHttps && isLoginLikePath) {
    shortBadge = 'HTTP LOGIN';
    warningReason =
      'Halaman login atau koneksi wallet menggunakan HTTP tanpa enkripsi HTTPS. Data sensitif dapat disadap di jaringan.';
  } else if (isNonHttps) {
    shortBadge = 'NON-HTTPS';
    warningReason =
      'Koneksi tidak terenkripsi (HTTP). Hindari memasukkan sandi, passkey, atau menandatangani transaksi wallet.';
  }

  return {
    rawUrl: trimmed,
    protocol,
    hostname,
    subdomain,
    primaryDomain,
    rest,
    isInternal: false,
    isPunycode,
    isNonHttps,
    isLoginLikePath,
    isSuspicious: isPunycode || isNonHttps,
    shortBadge,
    warningReason,
  };
}

export interface ScriptRiskAnalysis {
  isHighRisk: boolean;
  matchedSources: string[];
  matchedSinks: string[];
  summary: string;
}

const SENSITIVE_SOURCE_PATTERNS: { label: string; regex: RegExp }[] = [
  { label: 'document.cookie', regex: /\bdocument\s*\.\s*cookie\b/i },
  { label: 'localStorage', regex: /\blocalStorage\b/i },
  { label: 'sessionStorage', regex: /\bsessionStorage\b/i },
  { label: 'indexedDB', regex: /\bindexedDB\b/i },
  { label: 'token/privateKey', regex: /\b(private_?key|seed_?phrase|mnemonic|auth_?token)\b/i },
];

const OUTBOUND_SINK_PATTERNS: { label: string; regex: RegExp }[] = [
  { label: 'fetch()', regex: /\bfetch\s*\(/i },
  { label: 'XMLHttpRequest', regex: /\bXMLHttpRequest\b/i },
  { label: 'navigator.sendBeacon()', regex: /\bsendBeacon\s*\(/i },
  { label: 'WebSocket', regex: /\bnew\s+WebSocket\s*\(/i },
  { label: 'URL eksternal (Image/Redirect)', regex: /(\.src\s*=|location\.href\s*=|https?:\/\/[^\s"'`]+)/i },
];

export function analyzeTerminalScriptRisk(code: string): ScriptRiskAnalysis {
  const matchedSources = SENSITIVE_SOURCE_PATTERNS.filter((p) => p.regex.test(code)).map(
    (p) => p.label
  );
  const matchedSinks = OUTBOUND_SINK_PATTERNS.filter((p) => p.regex.test(code)).map(
    (p) => p.label
  );

  // High risk when reading cookie/storage/tokens AND sending data externally (or directly reading document.cookie + outbound)
  const isHighRisk = matchedSources.length > 0 && matchedSinks.length > 0;

  if (!isHighRisk) {
    return {
      isHighRisk: false,
      matchedSources,
      matchedSinks,
      summary: 'Tidak terdeteksi pola pencurian cookie atau eksfiltrasi token.',
    };
  }

  return {
    isHighRisk: true,
    matchedSources,
    matchedSinks,
    summary: `Skrip mencoba membaca data sensitif (${matchedSources.join(', ')}) dan mengirimkannya keluar melalui ${matchedSinks.join(', ')}. Jangan jalankan skrip dari sumber tidak tepercaya.`,
  };
}

export type SafeUriDecision =
  | { status: 'allow' }
  | { status: 'wallet-confirm'; scheme: string }
  | { status: 'block'; scheme: string; reason: string };

const BLOCKED_URI_SCHEMES = new Set([
  'file',
  'content',
  'javascript',
  'vbscript',
  'data',
  'blob',
  'intent',
  'android-app',
]);

const WHITELISTED_WALLET_SCHEMES = new Set(['wc', 'rabby', 'metamask', 'phantom', 'okx']);

export function validateSafeUri(rawInput: string): SafeUriDecision {
  const trimmed = rawInput.trim();
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!schemeMatch) {
    return { status: 'allow' };
  }

  const scheme = schemeMatch[1].toLowerCase();

  if (scheme === 'https' || scheme === 'http' || scheme === 'karsa') {
    return { status: 'allow' };
  }

  if (WHITELISTED_WALLET_SCHEMES.has(scheme)) {
    return { status: 'wallet-confirm', scheme: `${scheme}:` };
  }

  if (BLOCKED_URI_SCHEMES.has(scheme)) {
    return {
      status: 'block',
      scheme: `${scheme}://`,
      reason: `SafeUriValidator memblokir skema berisiko "${scheme}:" (standar OWASP MASVS). Hanya HTTPS/HTTP dan whitelist wallet resmi yang diizinkan.`,
    };
  }

  return {
    status: 'block',
    scheme: `${scheme}:`,
    reason: `SafeUriValidator menolak skema tidak dikenal "${scheme}:" demi keamanan WebView.`,
  };
}
