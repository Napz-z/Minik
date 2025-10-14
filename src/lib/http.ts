export class ApiError extends Error {
    /** HTTP 状态码 */
    status: number;
    /** 服务器返回的数据（若有） */
    data?: unknown;
    constructor(message: string, status: number, data?: unknown) {
      super(message);
      this.status = status;
      this.data = data;
    }
  }
  
  /**
   * 发送请求
   * @param url - 请求路径
   * @param options - 配置项（
   */
  export async function request<TResponse, TBody = unknown>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: TBody;
      headers?: HeadersInit;
      timeout?: number; // ms
      signal?: AbortSignal;
    } = {}
  ): Promise<TResponse> {
    const { method = 'GET', body, headers = {}, timeout = 8000, signal } = options;
  
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
  
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  
    const res = await fetch(url, {
      method,
      headers: isFormData
        ? headers
        : { 'Content-Type': 'application/json', ...headers },
      body: body == null ? undefined : (isFormData ? (body as any) : JSON.stringify(body)),
      signal: signal ?? controller.signal,
      credentials: 'same-origin',
    }).catch((err) => {
      clearTimeout(timeoutId);
      throw new ApiError('网络异常，请稍后重试', 0, err);
    });
  
    clearTimeout(timeoutId);
  
    if (!res.ok) {
      let errData: any = undefined;
      const ct = res.headers.get('content-type') || '';
      try {
        errData = ct.includes('application/json') ? await res.json() : await res.text();
      } catch {}
      throw new ApiError(
        (errData && (errData.error || errData.message)) || `请求失败（${res.status}）`,
        res.status,
        errData
      );
    }
  
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return (await res.json()) as TResponse;
    }
    // 非 JSON 的场景（如 dataURL 字符串等）
    return (await res.text()) as unknown as TResponse;
  }