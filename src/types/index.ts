/**
 * 类型定义统一导出文件
 * 提供所有类型的便捷导入入口
 */

export type {
  ShortenRequest,
  ShortenResponse,
  ApiErrorResponse,
} from './api';

export type {
  Link,
  CreateLinkInput,
  UpdateLinkInput,
  LinkWhereInput,
} from './database';

// 组件相关类型（可以在这里添加更多组件类型）
export interface ComponentProps {
  /** 组件的 className */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
}

/**
 * 通用的加载状态类型
 */
export interface LoadingState {
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 通用的表单状态类型
 */
export interface FormState<T = any> {
  /** 表单数据 */
  data: T;
  /** 是否正在提交 */
  submitting: boolean;
  /** 表单错误 */
  errors: Record<string, string>;
  /** 表单是否有效 */
  isValid: boolean;
}
