import { createHashRouter } from 'react-router-dom'
import RootLayout from '../layout/RootLayout'
import AdminLayout from '../layout/AdminLayout'
import AppErrorBoundary from '../errors/AppErrorBoundary'
import NotFound from '../errors/NotFound'
import HomePage from '../../pages/HomePage'
import PostsPage from '../../pages/PostsPage'
import PostDetailPage from '../../pages/PostDetailPage'
import ChallengePage from '../../pages/ChallengePage'
import AdminLoginPage from '../../pages/AdminLoginPage'
import AdminPostsPage from '../../pages/AdminPostsPage'
import AdminPostNewPage from '../../pages/AdminPostNewPage'
import AdminPostEditPage from '../../pages/AdminPostEditPage'
import ProtectedRoute from './ProtectedRoute'
import { Navigate } from 'react-router-dom'

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
          path: 'admin/login',
          element: <AdminLoginPage />,
        },
        {
          element: <ProtectedRoute />,
          children: [
            {
              path: 'admin',
              element: <AdminLayout />,
              children: [
                {
                  index: true,
                  element: <Navigate to="posts" replace />,
                },
                {
                  path: 'posts',
                  element: <AdminPostsPage />,
                },
                {
                  path: 'posts/new',
                  element: <AdminPostNewPage />,
                },
                {
                  path: 'posts/:id/edit',
                  element: <AdminPostEditPage />,
                },
              ],
            },
          ],
        },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])