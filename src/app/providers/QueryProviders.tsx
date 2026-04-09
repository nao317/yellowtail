import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

type Props = {
    children: ReactNode
}

export function QueryProviders({ children }: Props) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: 1,
                        staleTime: 1000 * 60 *5,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    )
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}