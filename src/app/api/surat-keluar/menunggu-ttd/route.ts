import { NextRequest } from 'next/server';
import { GET as daftarSurat } from '../route';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.searchParams.set('status', 'menunggu_ttd');
  return daftarSurat(new NextRequest(url, { headers: request.headers }));
}
