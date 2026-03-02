export interface IUser {
  user_id: string
  name: string
  email: string
  initial_name: string
  role: string
}

export interface ISignature {
  id: string
  x: number
  y: number
  page: number
  width: number
  height: number
  user_id: string | null
  name: string
  email: string
  initial_name?: string
  hash?: string
  signed: boolean
}

export interface ISignatureState {
  signatures: ISignature[]
  activeSignature: ISignature | null
  currentUser: IUser
  pageSize: {
    width: number
    height: number
  }
}

export interface IPdfFile {
  file?: File
  bytes?: Uint8Array
  name: string
  hash?: string
}