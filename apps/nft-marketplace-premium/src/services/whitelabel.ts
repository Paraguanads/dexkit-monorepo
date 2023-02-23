import { CollectionOwnershipNFTFormType } from '@/modules/contract-wizard/types';
import axios from 'axios';
import { DEXKIT_BASE_API_URL } from '../constants';
import { ConfigResponse, PageTemplateFormData, PageTemplateResponse, SiteResponse, WhitelabelFormData } from '../types/whitelabel';
import { getAccessToken } from './auth';

//const MY_APPS_ENDPOINT = 'https://dexkitapi-8oo4v.ondigitalocean.app';
//const MY_APPS_ENDPOINT = 'http://localhost:3000';
const MY_APPS_ENDPOINT = `${DEXKIT_BASE_API_URL}`;
//const MY_APPS_ENDPOINT = 'https://squid-app-xzo63.ondigitalocean.app';

/**
 * send config to server
 * @param formData
 * @returns
 */

export const myAppsApi = axios.create({ baseURL: MY_APPS_ENDPOINT, headers: { 'content-type': 'application/json' } });

myAppsApi.interceptors.request.use(async (config) => {
  const access_token = await getAccessToken()
  if (access_token)
    config.headers = {
      ...config.headers,
      authorization: `Bearer ${access_token}`
    }
  return config;

});


export async function sendConfig(formData: WhitelabelFormData) {
  return await myAppsApi.post<{ slug: string }>('/site/create-site', formData);
};

export async function upsertPageTemplate(formData: PageTemplateFormData) {
  return await myAppsApi.post('/site/create-page-template', formData);
};

/**
 * Get all configs associated with a wallet
 * @param owner
 * @returns
 */
export async function getConfigsByOwner(owner: string) {
  return await myAppsApi.get<ConfigResponse[]>(`/site/${owner}`);
};

/**
 * Get page template by Id
 * @param id
 * @returns
 */
export async function getPageTemplateById(id: string) {
  return await myAppsApi.get<PageTemplateResponse>(`/site/page-template/id/${id}`);
};

/**
 * Get all page tempaltes associated with a wallet
 * @param owner
 * @returns
 */
export async function getPageTemplatesByOwner(owner: string) {
  return await myAppsApi.get<PageTemplateResponse[]>(`/site/page-template/${owner}`);
};

/**
 * Get config by name or domain, at least one of these parameters should be passed
 * @param queryParameters
 * @returns
 */
export async function getConfig(queryParameters: {
  domain?: string;
  slug?: string;
}) {
  return await myAppsApi.get<ConfigResponse>(`/site`, { params: queryParameters });
};

/**
 * Get config by name or domain, at least one of these parameters should be passed
 * @param queryParameters
 * @returns
 */
export async function getSites(queryParameters: {
  skip?: number;
  take?: number;
}) {
  return await myAppsApi.get<SiteResponse[]>(`/site/all-open`, { params: queryParameters });
};


export async function deleteConfig(slug: string) {
  return await myAppsApi.delete<ConfigResponse[]>(`/site`, { params: { slug } });
};

export async function deletePageTemplate(id: string) {
  return await myAppsApi.delete<PageTemplateResponse[]>(`/site/page-template/${id}`);
};



export async function getDomainConfigStatus(domain: string) {
  return await myAppsApi.get<ConfigResponse[]>(`/site/domain-status`, { params: { domain } });
};

export async function getVerifyDomain(domain: string) {
  return await myAppsApi.get<ConfigResponse[]>(`/site/verify-domain`, { params: { domain } });
};


/**
 * setuo domain for app
 * @param formData 
 * @returns 
 */
export async function setupDomainConfig(domain: string) {
  return await myAppsApi.get<ConfigResponse[]>(`/site/setup-domain`, { params: { domain } });
};



export async function upsertWhitelabelAsset(siteId: number, nft: CollectionOwnershipNFTFormType) {
  return await myAppsApi.post<ConfigResponse[]>(`/contract/upsert/whitelabel/asset`, { siteId, nft });
};