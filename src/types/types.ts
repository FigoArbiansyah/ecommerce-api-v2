export interface User {
  id: number;           // ID pengguna
  email: string;       // Alamat email pengguna
  role: string;        // Role pengguna, seperti 'admin', 'user', dll.
}

export interface RequestWithUser extends Request {
  user?: any;
  headers: any;
  body: any;
  query: any;
  params: Record<string, string>; // Params biasanya berupa key-value string
  files?: Express.Multer.File[]; // Jika menggunakan file upload
  get: (name: string) => string | undefined; // Sesuai dengan definisi get pada express
  protocol: 'http' | 'https'; // Protokol HTTP atau HTTPS
}
