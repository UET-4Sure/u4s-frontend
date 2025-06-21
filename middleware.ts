import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: [
        // Chỉ áp dụng middleware cho các đường dẫn bắt đầu bằng "/"
        '/:path*',
    ],
};

export async function middleware(request: NextRequest) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Giả lập delay 10 giây
}