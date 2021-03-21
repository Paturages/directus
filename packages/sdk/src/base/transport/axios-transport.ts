import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { IStorage } from '../../storage';
import { ITransport, TransportMethods, TransportResponse, TransportError, TransportOptions } from '../../transport';

/**
 * Axios transport implementation
 */
export class AxiosTransport implements ITransport {
	private _url: string;
	private _storage: IStorage;
	public _axios: AxiosInstance;

	constructor(url: string, storage: IStorage) {
		this._url = url;
		this._storage = storage;
		this._axios = null as any;
		this.url = url;
	}

	get url(): string {
		return this._url;
	}

	set url(value: string) {
		this._url = value;
		this._axios = axios.create({ baseURL: value });
		this._axios.interceptors.request.use(this.createRequestConfig.bind(this));
	}

	get axios(): AxiosInstance {
		return this._axios;
	}

	private async request<T = any>(
		method: 'get',
		path: string,
		options?: TransportOptions
	): Promise<TransportResponse<T>>;
	private async request<T = any>(
		method: 'delete',
		path: string,
		options?: TransportOptions
	): Promise<TransportResponse<T>>;
	private async request<T = any>(
		method: 'head',
		path: string,
		options?: TransportOptions
	): Promise<TransportResponse<T>>;
	private async request<T = any>(
		method: 'options',
		path: string,
		options?: TransportOptions
	): Promise<TransportResponse<T>>;
	private async request<T = any, D = any>(
		method: 'post',
		path: string,
		data?: D,
		options?: TransportOptions
	): Promise<TransportResponse<T>>;
	private async request<T = any, D = any>(
		method: 'put',
		path: string,
		data?: D,
		options?: TransportOptions
	): Promise<TransportResponse<T>>;
	private async request<T = any, D = any>(
		method: 'patch',
		path: string,
		data?: D,
		options?: TransportOptions
	): Promise<TransportResponse<T>>;
	private async request<M extends TransportMethods, T = any>(
		method: M,
		path: string,
		...args: any
	): Promise<TransportResponse<T>> {
		try {
			const make = this.axios[method] as AxiosInstance[M];
			const response = await make<TransportResponse<T>>(path, ...args);
			const { data, meta, errors } = response.data;
			const content = {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
				data,
				meta,
				errors,
			};

			if (errors) {
				throw new TransportError<T>(null, content);
			}

			return content;
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const data = err.response?.data;
				throw new TransportError<T>(err, {
					status: err.response?.status,
					statusText: err.response?.statusText,
					headers: err.response?.headers,
					data: data?.data,
					meta: data?.meta,
					errors: data?.errors,
				});
			}
			throw new TransportError<T>(err);
		}
	}

	async get<T = any>(path: string, options?: TransportOptions): Promise<TransportResponse<T>> {
		return await this.request('get', path, options);
	}

	async delete<T = any>(path: string, options?: TransportOptions): Promise<TransportResponse<T>> {
		return await this.request('delete', path, options);
	}

	async head<T = any>(path: string, options?: TransportOptions): Promise<TransportResponse<T>> {
		return await this.request('head', path, options);
	}

	async options<T = any>(path: string, options?: TransportOptions): Promise<TransportResponse<T>> {
		return await this.request('options', path, options);
	}

	async put<T = any, D = any>(path: string, data?: D, options?: TransportOptions): Promise<TransportResponse<T>> {
		return await this.request('put', path, data, options);
	}

	async post<T = any, D = any>(path: string, data?: D, options?: TransportOptions): Promise<TransportResponse<T>> {
		return await this.request('post', path, data, options);
	}

	async patch<T = any, D = any>(path: string, data?: D, options?: TransportOptions): Promise<TransportResponse<T>> {
		return await this.request('patch', path, data, options);
	}

	private createRequestConfig(config: AxiosRequestConfig): AxiosRequestConfig {
		let token = this._storage.auth_token;
		if (!token) {
			return config;
		}

		if (token.startsWith(`Bearer `)) {
			config.headers.Authorization = token;
		} else {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	}
}
