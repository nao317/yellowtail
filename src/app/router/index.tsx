import { createHashRouter } from 'react-router-dom'
import RootLayout from '../layout/RootLayout'
import AppErrorBoundary from '../errors/AppErrorBoundary'
import NotFound from '../errors/NotFound'
import HomePage from '../../pages/HomePage'
import PostsPage from '../../pages/PostsPage'
import PostDetailPage from '../../pages/PostDetailPage'
import ChallengePage from '../../pages/ChallengePage'

export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <AppErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
        {
          path: 'posts',
          element: <PostsPage />,
        },
        {
          path: 'posts/:slug',
          element: <PostDetailPage />,
        },
        {
          path: 'challenge',
          element: <ChallengePage />,
        },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])