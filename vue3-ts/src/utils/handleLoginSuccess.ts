import { useUserStore } from "../store/userStore";
import { useThemeStore } from "../store/themeStore";

export const handleLoginSuccess = (
  user: any,
  locale: { value: string },
  router: any
) => {
  const userStore = useUserStore();
  const themeStore = useThemeStore();

  userStore.setUser({
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    sex: user.sex,
    birthday: user.birthday,
    introduce: user.introduce,
    constellation: user.constellation,
    nicknameColor: user.nicknameColor,
    clientFeatureCode: user.clientFeatureCode,
    uuid: user.uuid,
    username: user.username,
    phone: user.phone, // 添加 phone 字段
    theme: user.theme,
    role: user.role, // 添加 role 字段
  });

  themeStore.setUser(user.uuid);
  themeStore.loadTheme();

  if (user.uuid) {
    const savedLanguage = localStorage.getItem(`language-${user.uuid}`);
    locale.value = savedLanguage || "zh";
    if (!savedLanguage) {
      localStorage.setItem(`language-${user.uuid}`, "zh");
    }
  }

  router.push("/home");
};
