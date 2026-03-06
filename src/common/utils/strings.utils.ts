interface IDeviceInfo {
    device: string;
    os: string;
    browser: string;
    browserVersion: string;
    type: string;
}

export function parseUserAgent(userAgent: string): IDeviceInfo {
    return JSON.parse(userAgent) as IDeviceInfo;
}