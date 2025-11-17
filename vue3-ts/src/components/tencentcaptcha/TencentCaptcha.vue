<template>
  <div id="captcha-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, defineEmits, ref } from "vue";

const emit = defineEmits(["verified", "error", "loaded"]);

let captcha: any = null;
const isLoaded = ref(false);

// 启动腾讯云验证码
const startTencentCaptcha = () => {
  try {
    // 检查腾讯验证码JS是否已加载
    if (!(window as any).TencentCaptcha) {
      console.error("腾讯验证码JS未加载");
      emit("error", new Error("腾讯验证码JS未加载"));
      return false;
    }

    // 清理之前的实例
    if (captcha) {
      captcha.destroy();
      captcha = null;
    }

    console.log("启动腾讯云验证码，AppId: 193647721");

    // 腾讯验证码标准参数格式
    const options = {
      callback: (res: any) => {
        console.log("验证码回调结果:", res);
        // 验证成功回调
        if (res.ret === 0) {
          emit("verified", {
            ticket: res.ticket,
            randstr: res.randstr,
            captchaAppId: "193647721", // 明确传递 AppId
          });
        } else if (res.ret === 2) {
          // 用户主动关闭验证码
          console.log("用户取消验证");
          emit("error", new Error("用户取消验证"));
        } else {
          // 其他错误
          console.error("用户取消验证码");
          emit("error", new Error(`验证失败: ${res.ret}`));
        }
      },
    };

    // 创建验证码实例 - 使用正确的构造函数格式
    captcha = new (window as any).TencentCaptcha("193647721", options);

    isLoaded.value = true;
    emit("loaded", true);

    console.log("腾讯云验证码启动成功");
    return true;
  } catch (error) {
    console.error("启动腾讯云验证码失败:", error);
    emit("error", error);
    isLoaded.value = false;
    return false;
  }
};

// 显示验证码
const showCaptcha = () => {
  if (!captcha) {
    const started = startTencentCaptcha();
    if (!started) {
      return false;
    }
  }

  try {
    console.log("显示验证码");
    captcha.show();
    return true;
  } catch (error) {
    console.error("显示验证码失败:", error);
    emit("error", error);
    return false;
  }
};

// 清理资源
const cleanup = () => {
  if (captcha) {
    try {
      captcha.destroy();
      console.log("清理验证码实例");
    } catch (e) {
      console.warn("清理验证码实例时出错:", e);
    }
    captcha = null;
  }
  isLoaded.value = false;
};

onMounted(() => {
  console.log("TencentCaptcha组件挂载");
  // 确保腾讯验证码JS已加载
  if ((window as any).TencentCaptcha) {
    console.log("腾讯验证码JS已加载");
    emit("loaded", true);
  } else {
    console.warn("腾讯验证码JS未加载");
  }
});

onUnmounted(() => {
  cleanup();
});

// 暴露方法给父组件
defineExpose({
  startTencentCaptcha,
  showCaptcha,
  cleanup,
});
</script>

<style scoped>
#captcha-container {
  min-height: 44px;
  width: 100%;
}
</style>
