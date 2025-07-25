import revalidate from '@/app/actions'
import { queryClient } from '@/utils/api/query'
import { api } from '@/utils/client'
import { operations, schemas, unwrap } from '@polar-sh/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { defaultRetry } from './retry'

export const useListOrganizationMembers = (id: string) =>
  useQuery({
    queryKey: ['organizationMembers', id],
    queryFn: () =>
      unwrap(
        api.GET('/v1/organizations/{id}/members', { params: { path: { id } } }),
      ),
    retry: defaultRetry,
  })

export const useInviteOrganizationMember = (id: string) =>
  useMutation({
    mutationFn: (email: string) => {
      return api.POST('/v1/organizations/{id}/members/invite', {
        params: { path: { id } },
        body: { email },
      })
    },
    onSuccess: async (_result, _variables, _ctx) => {
      queryClient.invalidateQueries({
        queryKey: ['organizationMembers', id],
      })
    },
  })

export const useListOrganizations = (
  params: operations['organizations:list']['parameters']['query'],
  enabled: boolean = true,
) =>
  useQuery({
    queryKey: ['organizations', params],
    queryFn: () =>
      unwrap(api.GET('/v1/organizations/', { param: { query: params } })),
    retry: defaultRetry,
    enabled,
  })

export const useCreateOrganization = () =>
  useMutation({
    mutationFn: (body: schemas['OrganizationCreate']) => {
      return api.POST('/v1/organizations/', { body })
    },
    onSuccess: async (result, _variables, _ctx) => {
      const { data, error } = result
      if (error) {
        return
      }
      queryClient.invalidateQueries({
        queryKey: ['organizations', data.id],
      })
      await revalidate(`organizations:${data.id}`)
      await revalidate(`organizations:${data.slug}`)
      await revalidate(`storefront:${data.slug}`)
    },
  })

export const useUpdateOrganization = () =>
  useMutation({
    mutationFn: (variables: {
      id: string
      body: schemas['OrganizationUpdate']
    }) => {
      return api.PATCH('/v1/organizations/{id}', {
        params: { path: { id: variables.id } },
        body: variables.body,
      })
    },
    onSuccess: async (result, _variables, _ctx) => {
      const { data, error } = result
      if (error) {
        return
      }
      queryClient.invalidateQueries({
        queryKey: ['organizations', data.id],
      })
      await revalidate(`organizations:${data.id}`)
      await revalidate(`organizations:${data.slug}`)
    },
  })

export const useOrganization = (id: string, enabled: boolean = true) =>
  useQuery({
    queryKey: ['organizations', id],
    queryFn: () =>
      unwrap(api.GET('/v1/organizations/{id}', { params: { path: { id } } })),
    retry: defaultRetry,
    enabled,
  })

export const useOrganizationAccount = (id?: string) =>
  useQuery({
    queryKey: ['organizations', 'account', id],
    queryFn: () =>
      unwrap(
        api.GET('/v1/organizations/{id}/account', {
          params: { path: { id: id ?? '' } },
        }),
      ),
    retry: defaultRetry,
    enabled: !!id,
  })

export const useOrganizationAccessTokens = (
  organization_id: string,
  params?: Omit<
    NonNullable<
      operations['organization_access_token:list']['parameters']['query']
    >,
    'organization_id'
  >,
) =>
  useQuery({
    queryKey: [
      'organization_access_tokens',
      { organization_id, ...(params || {}) },
    ],
    queryFn: () =>
      unwrap(
        api.GET('/v1/organization-access-tokens/', {
          params: {
            query: {
              organization_id,
              ...(params || {}),
            },
          },
        }),
      ),
    retry: defaultRetry,
  })

export const useCreateOrganizationAccessToken = (organization_id: string) =>
  useMutation({
    mutationFn: (
      body: Omit<schemas['OrganizationAccessTokenCreate'], 'organization_id'>,
    ) => {
      return api.POST('/v1/organization-access-tokens/', {
        body: {
          ...body,
          organization_id,
        },
      })
    },
    onSuccess: (result, _variables, _ctx) => {
      const { error } = result
      if (error) {
        return
      }
      queryClient.invalidateQueries({
        queryKey: ['organization_access_tokens', { organization_id }],
      })
    },
  })

export const useUpdateOrganizationAccessToken = (id: string) =>
  useMutation({
    mutationFn: (body: schemas['OrganizationAccessTokenUpdate']) => {
      return api.PATCH('/v1/organization-access-tokens/{id}', {
        params: { path: { id } },
        body,
      })
    },
    onSuccess: (result, _variables, _ctx) => {
      const { data, error } = result
      if (error) {
        return
      }
      queryClient.invalidateQueries({
        queryKey: [
          'organization_access_tokens',
          { organization_id: data.organization_id },
        ],
      })
    },
  })

export const useDeleteOrganizationAccessToken = () =>
  useMutation({
    mutationFn: (variables: schemas['OrganizationAccessToken']) => {
      return api.DELETE('/v1/organization-access-tokens/{id}', {
        params: { path: { id: variables.id } },
      })
    },
    onSuccess: (result, variables, _ctx) => {
      const { error } = result
      if (error) {
        return
      }
      queryClient.invalidateQueries({
        queryKey: [
          'organization_access_tokens',
          { organization_id: variables.organization_id },
        ],
      })
    },
  })
