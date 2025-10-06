<template>
  <div class="freeze-management">
    <el-card class="management-card">
      <template #header>
        <div class="card-header">
          <h2 class="page-title">用户冻结管理</h2>
          <div class="header-actions">
            <el-button type="primary" @click="showFreezeDialog()" icon="Plus">
              冻结用户
            </el-button>
            <el-button @click="fetchFrozenUsers" icon="Refresh">刷新</el-button>
          </div>
        </div>
      </template>

      <!-- 用户搜索 -->
      <div class="search-container">
        <div class="search-header">
          <h3 class="section-title">用户搜索</h3>
          <span class="section-desc">通过用户名查找用户信息</span>
        </div>
        <div class="search-form">
          <div class="search-input-container">
            <div class="search-input-wrapper">
              <el-icon class="search-icon"><Search /></el-icon>
              <input
                v-model="searchForm.username"
                placeholder="请输入用户名..."
                class="search-input"
                @keyup.enter="searchUser"
                type="text"
              />
              <button
                v-if="searchForm.username"
                class="clear-btn"
                @click="searchForm.username = ''"
              >
                <el-icon><Close /></el-icon>
              </button>
            </div>
            <button class="search-button" @click="searchUser">
              <el-icon class="search-btn-icon"><Search /></el-icon>
              <span>搜索用户</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchedUser" class="search-result-card">
        <div class="result-header">
          <h3 class="section-title">用户信息</h3>
          <div class="user-status">
            <div
              class="status-badge"
              :class="searchedUser.isFrozen ? 'frozen' : 'normal'"
            >
              {{ searchedUser.isFrozen ? "已冻结" : "正常" }}
            </div>
          </div>
        </div>
        <div class="user-info-grid">
          <div class="info-column">
            <div class="info-item">
              <span class="label">ID:</span>
              <span class="value">{{ searchedUser.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">用户名:</span>
              <span class="value">{{ searchedUser.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">邮箱:</span>
              <span class="value">{{ searchedUser.email }}</span>
            </div>
            <div class="info-item">
              <span class="label">地区:</span>
              <span class="value">{{ searchedUser.area || "未设置" }}</span>
            </div>
            <div class="info-item">
              <span class="label">昵称:</span>
              <span class="value">{{ searchedUser.nickname || "未设置" }}</span>
            </div>
          </div>
          <div class="info-column">
            <div class="info-item">
              <span class="label">手机号:</span>
              <span class="value">{{ searchedUser.phone || "未设置" }}</span>
            </div>
            <div class="info-item">
              <span class="label">角色:</span>
              <span class="value">{{ getRoleText(searchedUser?.role) }}</span>
            </div>
            <div class="info-item">
              <span class="label">性别:</span>
              <span class="value">{{ getSexText(searchedUser.sex) }}</span>
            </div>
            <div class="info-item">
              <span class="label">生日:</span>
              <span class="value">{{
                searchedUser.birthday
                  ? formatDate(searchedUser.birthday)
                  : "未设置"
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">星座:</span>
              <span class="value">{{
                searchedUser.constellation || "未设置"
              }}</span>
            </div>
          </div>
          <div class="info-column">
            <div class="info-item">
              <span class="label">主题:</span>
              <span class="value">{{ searchedUser.theme || "未设置" }}</span>
            </div>
            <div class="info-item">
              <span class="label">UUID:</span>
              <span class="value">{{ searchedUser.uuid || "未设置" }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间:</span>
              <span class="value">{{
                searchedUser?.createdAt
                  ? formatDate(searchedUser.createdAt)
                  : "N/A"
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">更新时间:</span>
              <span class="value">{{
                searchedUser?.updatedAt
                  ? formatDate(searchedUser.updatedAt)
                  : "M/A"
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">昵称颜色:</span>
              <span class="value color-value">
                <span
                  class="color-preview"
                  :style="{ backgroundColor: searchedUser.nicknameColor }"
                ></span>
                {{ searchedUser.nicknameColor || "未设置" }}
              </span>
            </div>
          </div>
        </div>
        <div class="user-actions">
          <button
            v-if="!searchedUser.isFrozen"
            class="action-btn freeze-btn"
            @click="showFreezeDialogForUser(searchedUser)"
          >
            <el-icon><Lock /></el-icon>
            <span>冻结用户</span>
          </button>
          <button
            v-else
            class="action-btn unfreeze-btn"
            @click="showUnfreezeDialogForUser(searchedUser)"
          >
            <el-icon><Unlock /></el-icon>
            <span>解冻用户</span>
          </button>
        </div>
      </div>

      <!-- 冻结用户列表 -->
      <div class="frozen-users-section">
        <div class="section-header">
          <h3 class="section-title">已冻结用户列表</h3>
          <span class="section-desc">当前共有 {{ total }} 个冻结用户</span>
        </div>
        <el-table
          :data="frozenUsers"
          style="width: 100%"
          v-loading="loading"
          stripe
          class="frozen-users-table"
        >
          <el-table-column
            prop="id"
            label="用户ID"
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="username"
            label="用户名"
            width="150"
          ></el-table-column>
          <el-table-column
            prop="email"
            label="邮箱"
            width="200"
          ></el-table-column>
          <el-table-column
            prop="area"
            label="地区"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="nickname"
            label="昵称"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="clientFeatureCode"
            label="特征码"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="frozenReason"
            label="冻结原因"
            width="200"
          ></el-table-column>
          <el-table-column prop="frozenAt" label="冻结时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.frozenAt) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="freezeType"
            label="冻结类型"
            width="120"
            align="center"
          >
            <template #default="scope">
              <div class="freeze-type-badge" :class="scope.row.freezeType">
                {{
                  scope.row.freezeType === "permanent" ? "永久冻结" : "临时冻结"
                }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="unfreezeAt"
            label="解冻时间"
            width="180"
            v-show="detailUser?.freezeType === 'temporary'"
          >
            <template #default="scope">
              {{
                scope.row.unfreezeAt ? formatDate(scope.row.unfreezeAt) : "N/A"
              }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="180"
            align="center"
            fixed="right"
          >
            <template #default="scope">
              <button
                class="table-action-btn primary"
                @click="showUnfreezeDialog(scope.row)"
              >
                <el-icon><Unlock /></el-icon>
                解冻
              </button>
              <button
                class="table-action-btn"
                @click="viewUserDetails(scope.row)"
              >
                <el-icon><View /></el-icon>
                详情
              </button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 自定义冻结弹窗 -->
    <div
      v-if="freezeDialogVisible"
      class="custom-modal-overlay"
      @click="closeFreezeModal"
    >
      <div class="custom-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">冻结用户</h3>
          <button class="close-btn" @click="closeFreezeModal">
            <el-icon><Close /></el-icon>
          </button>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input
              v-model="freezeForm.username"
              placeholder="请输入要冻结的用户名"
              :disabled="!!freezeForm.userId"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">冻结类型</label>
            <div class="radio-group">
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="freezeForm.freezeType"
                  value="temporary"
                />
                <span class="radio-label">临时冻结</span>
              </label>
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="freezeForm.freezeType"
                  value="permanent"
                />
                <span class="radio-label">永久冻结</span>
              </label>
            </div>
          </div>

          <div class="form-group" v-if="freezeForm.freezeType === 'temporary'">
            <label class="form-label">冻结天数</label>
            <input
              type="number"
              v-model.number="freezeForm.durationDays"
              placeholder="请输入冻结天数"
              min="1"
              max="365"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">冻结原因</label>
            <textarea
              v-model="freezeForm.reason"
              placeholder="请输入冻结原因"
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="closeFreezeModal">
            取消
          </button>
          <button
            class="modal-btn confirm"
            @click="confirmFreeze"
            :disabled="freezing"
          >
            {{ freezing ? "处理中..." : "确认冻结" }}
          </button>
        </div>
      </div>
    </div>

    <!-- 自定义解冻弹窗 -->
    <div
      v-if="unfreezeDialogVisible"
      class="custom-modal-overlay"
      @click="closeUnfreezeModal"
    >
      <div class="custom-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">解冻用户</h3>
          <button class="close-btn" @click="closeUnfreezeModal">
            <el-icon><Close /></el-icon>
          </button>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input
              v-model="unfreezeForm.username"
              disabled
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">解冻理由</label>
            <textarea
              v-model="unfreezeForm.reason"
              placeholder="请输入解冻理由（可选）"
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="closeUnfreezeModal">
            取消
          </button>
          <button
            class="modal-btn confirm"
            @click="confirmUnfreeze"
            :disabled="unfreezing"
          >
            {{ unfreezing ? "处理中..." : "确认解冻" }}
          </button>
        </div>
      </div>
    </div>

    <!-- 自定义详情弹窗 -->
    <div
      v-if="showCustomDetail"
      class="custom-modal-overlay"
      @click="closeDetailModal"
    >
      <div class="custom-modal detail-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">用户详情</h3>
          <button class="close-btn" @click="closeDetailModal">
            <el-icon><Close /></el-icon>
          </button>
        </div>
        <div class="modal-content detail-content">
          <div class="detail-section">
            <h4 class="section-title">用户基本信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">ID:</span>
                <span class="value">{{ detailUser?.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">用户名:</span>
                <span class="value">{{ detailUser?.username }}</span>
              </div>
              <div class="info-item">
                <span class="label">邮箱:</span>
                <span class="value">{{ detailUser?.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">地区:</span>
                <span class="value">{{ detailUser?.area || "未设置" }}</span>
              </div>
              <div class="info-item">
                <span class="label">昵称:</span>
                <span class="value">{{
                  detailUser?.nickname || "未设置"
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">手机号:</span>
                <span class="value">{{ detailUser?.phone || "未设置" }}</span>
              </div>
              <div class="info-item">
                <span class="label">角色:</span>
                <span class="value">{{ getRoleText(detailUser?.role) }}</span>
              </div>
              <div class="info-item">
                <span class="label">性别:</span>
                <span class="value">{{ getSexText(detailUser?.sex) }}</span>
              </div>
              <div class="info-item">
                <span class="label">生日:</span>
                <span class="value">{{
                  detailUser?.birthday
                    ? formatDate(detailUser.birthday)
                    : "未设置"
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">星座:</span>
                <span class="value">{{
                  detailUser?.constellation || "未设置"
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">主题:</span>
                <span class="value">{{ detailUser?.theme || "未设置" }}</span>
              </div>
              <div class="info-item">
                <span class="label">UUID:</span>
                <span class="value">{{ detailUser?.uuid || "未设置" }}</span>
              </div>
              <div class="info-item">
                <span class="label">创建时间:</span>
                <span class="value">{{
                  detailUser?.createdAt
                    ? formatDate(detailUser.createdAt)
                    : "N/A"
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">更新时间:</span>
                <span class="value">{{
                  detailUser?.updatedAt
                    ? formatDate(detailUser.updatedAt)
                    : "M/A"
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">设备特征码:</span>
                <span class="value">{{
                  detailUser?.clientFeatureCode || "未设置"
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">昵称颜色:</span>
                <span class="value color-value">
                  <span
                    class="color-preview"
                    :style="{ backgroundColor: detailUser?.nicknameColor }"
                  ></span>
                  {{ detailUser?.nicknameColor || "未设置" }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">个人简介:</span>
                <span class="value">{{
                  detailUser?.introduce || "未设置"
                }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="section-title">冻结信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">冻结原因:</span>
                <span class="value">{{
                  detailUser?.frozenReason || "N/A"
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">冻结时间:</span>
                <span class="value">{{
                  detailUser?.frozenAt ? formatDate(detailUser.frozenAt) : "N/A"
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">冻结类型:</span>
                <span class="value">
                  <div
                    class="freeze-type-badge"
                    :class="detailUser?.freezeType"
                  >
                    {{
                      detailUser?.freezeType === "permanent"
                        ? "永久冻结"
                        : "临时冻结"
                    }}
                  </div>
                </span>
              </div>

              <div
                class="info-item"
                v-if="detailUser?.freezeType === 'temporary'"
              >
                <span class="label">解冻时间:</span>
                <span class="value">{{
                  detailUser?.unfreezeAt
                    ? formatDate(detailUser.unfreezeAt)
                    : "N/A"
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">冻结消息:</span>
                <span class="value">{{
                  detailUser?.frozenMessage || "N/A"
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn confirm" @click="closeDetailModal">
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import {
  Search,
  Plus,
  Refresh,
  Lock,
  Unlock,
  View,
  Close,
} from "@element-plus/icons-vue";
import axiosConfig from "../../utils/request";

interface User {
  id: number;
  username: string;
  email: string;
  isFrozen: number;
  frozenReason?: string;
  frozenAt?: string;
  freezeType?: string;
  unfreezeAt?: string | null;
  area?: string;
  nickname?: string;
  phone?: string;
  role?: string;
  theme?: string;
  sex?: number;
  birthday?: string;
  constellation?: string;
  uuid?: string;
  createdAt?: string;
  updatedAt?: string;
  clientFeatureCode?: string;
  nicknameColor?: string;
  introduce?: string;
  frozenMessage?: string;
}

const frozenUsers = ref<User[]>([]);
const searchedUser = ref<User | null>(null);
const loading = ref(false);
const freezing = ref(false);
const unfreezing = ref(false);
const freezeDialogVisible = ref(false);
const unfreezeDialogVisible = ref(false);
const freezeFormRef = ref<FormInstance>();

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const searchForm = reactive({
  username: "",
});

const freezeForm = reactive({
  userId: null as number | null,
  username: "",
  freezeType: "temporary",
  durationDays: 7,
  reason: "",
});

const unfreezeForm = ref({
  userId: 0,
  username: "",
  reason: "",
});

// 表单验证规则
const freezeFormRules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  reason: [{ required: true, message: "请输入冻结原因", trigger: "blur" }],
  durationDays: [
    { required: true, message: "请输入冻结天数", trigger: "blur" },
    {
      type: "number",
      min: 1,
      max: 365,
      message: "冻结天数必须在1-365之间",
      trigger: "blur",
    },
  ],
};

// 自定义详情弹窗相关变量
const showCustomDetail = ref(false);
const detailUser = ref<User | null>(null);

// 获取冻结用户列表
const fetchFrozenUsers = async () => {
  loading.value = true;
  try {
    const response = await axiosConfig.get("/admin/auth/freeze/list", {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
      },
    });
    if (response.data.data.users.length === 0) {
      frozenUsers.value = [];
      total.value = 0;
      pageSize.value = 10;
      currentPage.value = 1;
      ElMessage.info("暂无冻结用户,请尝试其他操作");
      return;
    }
    frozenUsers.value = response.data.data.users;
    total.value = response.data.data.total;
    pageSize.value = response.data.data.pageSize;
    currentPage.value = response.data.data.page;
    ElMessage.success(response.data.message || "获取冻结用户列表成功");
  } catch (error) {
    ElMessage.error("获取冻结用户列表失败");
    console.error("获取冻结用户列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 搜索用户
const searchUser = async () => {
  if (!searchForm.username || searchForm.username.trim().length === 0) {
    ElMessage.error("请输入有效的用户名");
    return;
  }

  if (searchForm.username.length > 50) {
    ElMessage.error("搜索关键词过长");
    return;
  }

  // 添加防抖，避免频繁请求
  if ((searchUser as any).debounceTimer) {
    clearTimeout((searchUser as any).debounceTimer);
  }

  (searchUser as any).debounceTimer = setTimeout(async () => {
    try {
      const response = await axiosConfig.get(
        `/admin/auth/search/${encodeURIComponent(searchForm.username.trim())}`
      );
      searchedUser.value = response.data.data.users[0] || null;
      ElMessage.success(response.data.message);
      if (!searchedUser.value) {
        ElMessage.warning("未找到匹配的用户");
      }
    } catch (error: any) {
      console.error("搜索用户失败:", error);
      ElMessage.error(error.response?.data?.message || "搜索用户失败");
      searchedUser.value = null;
    }
  }, 300);
};

// 初始化防抖计时器
(searchUser as any).debounceTimer = null;

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN");
};

// 获取性别文本
const getSexText = (sex: number | undefined) => {
  if (sex === undefined) return "未设置";
  return sex === 1 ? "男" : sex === 0 ? "女" : "未知";
};

// 显示冻结对话框
const showFreezeDialog = () => {
  freezeForm.userId = null;
  freezeForm.username = "";
  freezeForm.freezeType = "temporary";
  freezeForm.durationDays = 7;
  freezeForm.reason = "";
  freezeDialogVisible.value = true;
};

// 为特定用户显示冻结对话框
const showFreezeDialogForUser = (user: User) => {
  freezeForm.userId = user.id;
  freezeForm.username = user.username;
  freezeForm.freezeType = "temporary";
  freezeForm.durationDays = 7;
  freezeForm.reason = "";
  freezeDialogVisible.value = true;
};

// 为特定用户显示解冻对话框
const showUnfreezeDialogForUser = (user: User) => {
  unfreezeForm.value = {
    userId: user.id,
    username: user.username,
    reason: "",
  };
  unfreezeDialogVisible.value = true;
};

// 显示解冻对话框
const showUnfreezeDialog = (user: User) => {
  unfreezeForm.value = {
    userId: user.id,
    username: user.username,
    reason: "",
  };
  unfreezeDialogVisible.value = true;
};

// 关闭冻结弹窗
const closeFreezeModal = () => {
  freezeDialogVisible.value = false;
};

// 关闭解冻弹窗
const closeUnfreezeModal = () => {
  unfreezeDialogVisible.value = false;
};

// 确认冻结
const confirmFreeze = async () => {
  if (!freezeForm.username || !freezeForm.reason) {
    ElMessage.error("请填写完整的冻结信息");
    return;
  }

  if (
    freezeForm.freezeType === "temporary" &&
    (!freezeForm.durationDays ||
      freezeForm.durationDays < 1 ||
      freezeForm.durationDays > 365)
  ) {
    ElMessage.error("冻结天数必须在1-365之间");
    return;
  }

  freezing.value = true;
  try {
    const response = await axiosConfig.post("/admin/auth/freeze", {
      username: freezeForm.username,
      reason: freezeForm.reason,
      freezeType: freezeForm.freezeType,
      durationDays: freezeForm.durationDays,
    });

    ElMessage.success(response.data.message);
    freezeDialogVisible.value = false;
    searchedUser.value = null;
    fetchFrozenUsers();
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || "冻结操作失败");
    console.error("冻结失败:", error);
  } finally {
    freezing.value = false;
  }
};

// 确认解冻
const confirmUnfreeze = async () => {
  if (!unfreezeForm.value.userId) return;

  unfreezing.value = true;
  try {
    const response = await axiosConfig.post("/auth/unfreeze", {
      userId: unfreezeForm.value.userId,
      reason: unfreezeForm.value.reason,
    });
    console.log(response);

    ElMessage.success(response.data.message);
    unfreezeDialogVisible.value = false;
    searchedUser.value = null;
    fetchFrozenUsers();
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || "解冻操作失败");
    console.error("解冻失败:", error);
  } finally {
    unfreezing.value = false;
  }
};

// 查看用户详情
const viewUserDetails = (user: User) => {
  detailUser.value = user;
  showCustomDetail.value = true;
};

// 关闭详情弹窗
const closeDetailModal = () => {
  showCustomDetail.value = false;
  detailUser.value = null;
};
// 获取角色文本
const getRoleText = (role: string | undefined) => {
  return role === "admin" ? "管理员" : "普通用户";
};

// 分页相关方法
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchFrozenUsers();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchFrozenUsers();
};

onMounted(() => {
  fetchFrozenUsers();
});
</script>

<style lang="less" scoped>
@import "../../base-ui/freezemanagement.less";
</style>
