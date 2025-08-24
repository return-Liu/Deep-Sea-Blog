import { createI18n } from "vue-i18n";
import { zh } from "./zh";
import { en } from "./en";
import { zh_TW } from "./zh_TW";

const messages = {
  zh,
  en,
  zh_TW,
};

const i18n = createI18n({
  locale: "zh", // 设置默认语言
  messages,
});

export default i18n;
