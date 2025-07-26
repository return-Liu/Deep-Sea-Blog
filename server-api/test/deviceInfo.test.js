const { extractDeviceInfo } = require("../utils/deviceInfo");
const { getIPGeoLocation } = require("../utils/ipGeo");

// 模拟 getIPGeoLocation 函数
jest.mock("../utils/ipGeo", () => ({
  getIPGeoLocation: jest.fn(),
}));

describe("extractDeviceInfo", () => {
  beforeEach(() => {
    // 重置模拟函数的调用历史
    jest.clearAllMocks();
  });

  test("should correctly identify Windows 10 with Chrome", async () => {
    const mockReq = {
      get: jest
        .fn()
        .mockReturnValue(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        ),
      headers: {},
      connection: {},
      socket: {},
    };

    getIPGeoLocation.mockResolvedValue({
      location: "中国 北京",
      raw: { country: "CN", city: "Beijing" },
    });

    const result = await extractDeviceInfo(mockReq);

    expect(result.os).toContain("Windows");
    expect(result.browser).toContain("Chrome");
    expect(result.deviceType).toBe("pc");
    expect(result.ip).toBe("0.0.0.0");
  });

  test("should correctly identify iPhone with Safari", async () => {
    const mockReq = {
      get: jest
        .fn()
        .mockReturnValue(
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        ),
      headers: {},
      connection: {},
      socket: {},
    };

    getIPGeoLocation.mockResolvedValue({
      location: "美国 加利福尼亚",
      raw: { country: "US", city: "California" },
    });

    const result = await extractDeviceInfo(mockReq);

    expect(result.os).toContain("iOS");
    expect(result.browser).toContain("Safari");
    expect(result.deviceType).toBe("mobile");
    expect(result.deviceName).toBe("iPhone");
  });

  test("should correctly identify Android tablet", async () => {
    const mockReq = {
      get: jest
        .fn()
        .mockReturnValue(
          "Mozilla/5.0 (Linux; Android 10; SM-T510) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36"
        ),
      headers: {},
      connection: {},
      socket: {},
    };

    getIPGeoLocation.mockResolvedValue({
      location: "德国 柏林",
      raw: { country: "DE", city: "Berlin" },
    });

    const result = await extractDeviceInfo(mockReq);

    expect(result.os).toContain("Android");
    expect(result.browser).toContain("Chrome");
    expect(result.deviceType).toBe("tablet");
    expect(result.deviceName).toBe("Android Tablet");
  });

  test("should handle missing User-Agent", async () => {
    const mockReq = {
      get: jest.fn().mockReturnValue(""),
      headers: {},
      connection: {},
      socket: {},
    };

    getIPGeoLocation.mockResolvedValue({
      location: "未知位置",
      raw: null,
    });

    const result = await extractDeviceInfo(mockReq);

    expect(result.os).toBe("Unknown");
    expect(result.browser).toBe("Unknown");
    expect(result.deviceType).toBe("pc");
  });

  test("should handle IP geolocation failure", async () => {
    const mockReq = {
      get: jest
        .fn()
        .mockReturnValue(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        ),
      headers: {},
      connection: {},
      socket: {},
    };

    getIPGeoLocation.mockRejectedValue(
      new Error("Geolocation service unavailable")
    );

    const result = await extractDeviceInfo(mockReq);

    expect(result.geoLocation).toBe("未知位置");
    expect(result.os).toBe("Unknown");
    expect(result.browser).toBe("Unknown");
  });

  test("should correctly extract IP from headers", async () => {
    const mockReq = {
      get: jest
        .fn()
        .mockReturnValue("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"),
      headers: {
        "x-forwarded-for": "192.168.1.100",
        "x-real-ip": "192.168.1.101",
      },
      connection: {},
      socket: {},
    };

    getIPGeoLocation.mockResolvedValue({
      location: "中国 上海",
      raw: { country: "CN", city: "Shanghai" },
    });

    const result = await extractDeviceInfo(mockReq);

    expect(result.ip).toBe("192.168.1.100");
  });
});
