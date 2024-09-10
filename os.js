export const getOS = () => {
  var userAgent = window.navigator.userAgent,
    platform =
      window.navigator?.userAgentData?.platform || window.navigator.platform,
    macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K', 'macOS'],
    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
    iosPlatforms = ['iPhone', 'iPad', 'iPod'],
    fetchOs = null;
  if (macosPlatforms.indexOf(platform) !== -1) {
    fetchOs = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    fetchOs = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    fetchOs = 'Windows';
  } else if (/Android/.test(userAgent)) {
    fetchOs = 'Android';
  } else if (/Linux/.test(platform)) {
    fetchOs = 'Linux';
  }
  return fetchOs;
};

export const os = getOS();
