export interface User {
  id: number;           // ID pengguna
  email: string;       // Alamat email pengguna
  role: string;        // Role pengguna, seperti 'admin', 'user', dll.
}

export interface RequestWithUser extends Request {
  user: string // or any other type
  headers: any;
  body: any;
  params: any;
  files: any;
  get: any;
  protocol: any;
}
