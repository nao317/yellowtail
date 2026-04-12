import { describe, expect, test, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import HomePage from './HomePage'
import { useQuery } from '@tanstack/react-query'

vi.mock(`@tanstack/react-query`, () => ({
    useQuery: vi.fn(),
}))

vi.mock('../components/Silk', () => ({
    default: () => <div data-testid="silk-bg" />,
}))

const mockedUseQuery = vi.mocked(useQuery)

describe('HomePage', () => {
    beforeEach(() => {
        mockedUseQuery.mockReset()
    })
    test('読み込み中メッセージを表示する', () => {
        mockedUseQuery.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
        } as ReturnType<typeof useQuery>)

        render(<HomePage />)
        
        expect(
            screen.getByText('プロフィールを読み込み中です')
        ).toBeInTheDocument()
    })

    test('エラーメッセージを表示する', () => {
        mockedUseQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new Error('network failed'),
        } as ReturnType<typeof useQuery>)

        render(<HomePage />)

        expect(screen.getByRole('alert')).toHaveTextContent(
            'プロフィールの取得に失敗しました network failed'
        )
    })

    test('データなしメッセージを表示する', () => {
        mockedUseQuery.mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
            error: null,
        } as ReturnType<typeof useQuery>)

        render(<HomePage />)

        expect(
            screen.getByText('表示できるプロフィールがまだありません')
        ).toBeInTheDocument()
    })

    test('プロフィール情報を表示する', () => {
        mockedUseQuery.mockReturnValue({
            data: {
                id: '1',
                username: 'taro',
                role: 'admin',
                createdAt: '2026-04-01T00:00:00.000Z'
            },
            isLoading: false,
            isError: false,
            error: null,
        } as ReturnType<typeof useQuery>)

        render(<HomePage />)

        expect(screen.getByText('taro')).toBeInTheDocument()
        expect(screen.getByText('このサイトを作った日')).toBeInTheDocument()
    })
})
