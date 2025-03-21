// Interface para o perfil do usuário
export interface Perfil {
    id: string;
    nome: string;
    imagem?: string;
  }
  
  // Interface para funcionários
  export interface Funcionario {
    id: string;
    nome: string;
    imagem?: string;
    email: string;
    numero: string;
    salario: number;
  }
  
  // Interface para produtos
  export interface Produto {
    id: string;
    nome: string;
    imagem?: string;
    descricao: string;
    valor: number;
    quantidade: number;
  }
  
  // Interface para respostas de erro
  export interface ErrorResponse {
    message: string;
    code: string;
    status: number;
  }