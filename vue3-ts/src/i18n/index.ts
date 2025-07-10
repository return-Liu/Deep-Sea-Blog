import { createI18n } from "vue-i18n";
import { zh } from "./zh";
import { en } from "./en";
import { zh_TW } from "./zh_TW";
import { ja } from "./ja";
import { ko } from "./ko";

const messages = {
  zh,
  en,
  zh_TW,
  ja,
  ko,
};

const i18n = createI18n({
  locale: "zh", // 设置默认语言
  messages,
});

export default i18n;
