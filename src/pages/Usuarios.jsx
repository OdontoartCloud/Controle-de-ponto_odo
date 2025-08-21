
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { mockUsers, UserRole } from '@/types';

const Usuarios = () => {
  const [users] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-red-100 text-red-800';
      case UserRole.MANAGER: return 'bg-blue-100 text-blue-800';
      case UserRole.USER: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case UserRole.ADMIN: return 'Administrador';
      case UserRole.MANAGER: return 'Gerente';
      case UserRole.USER: return 'Usuário';
      default: return 'Desconhecido';
    }
  };

  const handleAddUser = () => {
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  const handleEditUser = (user) => {
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  const handleDeleteUser = (user) => {
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  const handleToggleStatus = (user) => {
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  return (
    <>
      <Helmet>
        <title>Usuários - Controle de Ponto</title>
        <meta name="description" content="Gerencie usuários do sistema de controle de ponto, adicione novos usuários e configure permissões." />
      </Helmet>

      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
              <p className="text-gray-600 mt-2">
                Gerencie usuários e suas permissões no sistema
              </p>
            </div>
            <Button 
              onClick={handleAddUser}
              className="bg-primary-500 hover:bg-primary-600 text-white w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
          >
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2 justify-center">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-6 sm:mx-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[150px]">Nome</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[200px] hidden sm:table-cell">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[120px] hidden md:table-cell">Departamento</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[100px] hidden lg:table-cell">Função</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[80px]">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 min-w-[120px]">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-700 font-medium">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900 block">{user.name}</span>
                                <span className="text-sm text-gray-500 sm:hidden">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600 hidden sm:table-cell">{user.email}</td>
                          <td className="py-4 px-4 text-gray-600 hidden md:table-cell">{user.department}</td>
                          <td className="py-4 px-4 hidden lg:table-cell">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                              {getRoleText(user.role)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                className="text-gray-600 hover:text-primary-600"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(user)}
                                className={`${user.active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                              >
                                {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    </>
  );
};

export default Usuarios;
