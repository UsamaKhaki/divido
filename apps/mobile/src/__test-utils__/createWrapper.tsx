import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react-native'
import React from 'react'

/**
 * Returns a wrapper component that provides a fresh isolated QueryClient.
 * Use with renderHook/render for every test.
 */
export const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return { Wrapper, queryClient }
}

/**
 * Renders a component wrapped in a fresh QueryClientProvider.
 */
export const renderWithQuery = (ui: React.ReactElement) => {
  const { Wrapper, queryClient } = createWrapper()
  const result = render(ui, { wrapper: Wrapper })
  return { ...result, queryClient }
}
