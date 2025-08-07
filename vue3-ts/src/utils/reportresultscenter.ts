export const resultTypeOptions = [
  { value: "fixed", label: "已修复" },
  { value: "verified", label: "已核实" },
  { value: "rejected", label: "已驳回" },
  { value: "ignored", label: "已忽略" },
  { value: "other", label: "其他处理" },
];

export const formatResultType = (type: string) => {
  const map: Record<string, string> = {
    fixed: "已修复",
    verified: "已核实",
    rejected: "已驳回",
    ignored: "已忽略",
    other: "其他处理",
  };
  return map[type] || "未知状态";
};
