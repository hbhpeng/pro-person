declare namespace wx {
  // 公共API接口
  function config(options: ConfigOptions): void;
  function ready(callback: () => void): void;
  function error(callback: (res: { errMsg: string }) => void): void;
  function checkJsApi(options: CheckJsApiOptions): void;
  function onMenuShareTimeline(options: ShareTimelineOptions): void;
  function onMenuShareAppMessage(options: ShareAppMessageOptions): void;
  function onMenuShareQQ(options: ShareQQOptions): void;
  function onMenuShareWeibo(options: ShareWeiboOptions): void;
  function onMenuShareQZone(options: ShareQZoneOptions): void;

  // 支付接口
  interface ChooseWXPayOptions {
    timestamp: number;
    nonceStr: string;
    package: string;
    signType: string;
    paySign: string;
    success?: () => void;
    cancel?: () => void;
    fail?: (res: { err_msg: string }) => void;
  }

  function chooseWXPay(options: ChooseWXPayOptions): void;

}

// 其他接口类型定义
interface ConfigOptions {
  debug?: boolean;
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
  jsApiList: string[];
}

interface CheckJsApiOptions {
  jsApiList: string[];
  success?: (res: { [key: string]: boolean }) => void;
}

interface ShareTimelineOptions {
  title: string;
  link: string;
  imgUrl: string;
  success?: () => void;
  cancel?: () => void;
}

interface ShareAppMessageOptions {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
  type?: string;
  dataUrl?: string;
  success?: () => void;
  cancel?: () => void;
}

// 定义其他接口类型...
