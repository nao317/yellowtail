import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '../layout/RootLayout'
import AppErrorBoundary from '../errors/AppErrorBoundary'
import NotFound from '../errors/NotFound'
import HomePage from '../../pages/HomePage'

export const router = createBrowserRouter([
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
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])