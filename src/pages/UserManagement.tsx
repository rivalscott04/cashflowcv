import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Users, Building2, Shield, User, Filter, UserPlus, Crown, Settings, Eye, Mail, Calendar, Activity } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin' | 'superadmin';
  company_id?: number;
  company?: {
    id: number;
    name: string;
    code: string;
  };
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
  code: string;
  users: User[];
  userCount: number;
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: 'user' | 'admin' | 'superadmin';
  company_id?: number;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all-roles');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('grouped');
  
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'user',
    company_id: undefined
  });

  // Check if current user is superadmin
  if (!currentUser || currentUser.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You need superadmin privileges to access user management.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Fetch users grouped by company
  const { data: groupedData, isLoading: isLoadingGrouped, error: groupedError } = useQuery({
    queryKey: ['users', 'grouped-by-company', searchTerm, selectedRole],
    queryFn: async () => {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedRole !== 'all-roles') params.role = selectedRole;
      
      console.log('Fetching grouped users with params:', params);
      const response = await api.users.getGroupedByCompany(params);
      console.log('Grouped users response:', response);
      return response.data;
    },
    enabled: activeTab === 'grouped'
  });

  // Fetch all users
  const { data: allUsersData, isLoading: isLoadingAll, error: allUsersError } = useQuery({
    queryKey: ['users', 'all', searchTerm, selectedRole],
    queryFn: async () => {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedRole !== 'all-roles') params.role = selectedRole;
      
      console.log('Fetching all users with params:', params);
      const response = await api.users.getAll(params);
      console.log('All users response:', response);
      return response.data;
    },
    enabled: activeTab === 'all'
  });

  // Fetch companies for form
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.companies.getAll();
      return response.data.companies;
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const response = await api.users.create(userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create user');
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: Partial<UserFormData> }) => {
      const response = await api.users.update(id, userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      resetForm();
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await api.users.delete(userId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    }
  });

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'user',
      company_id: undefined
    });
  };

  const handleCreateUser = () => {
    createUserMutation.mutate(formData);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      full_name: user.full_name,
      role: user.role,
      company_id: user.company_id
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    const updateData = { ...formData };
    if (!updateData.password) {
      delete updateData.password;
    }
    
    updateUserMutation.mutate({ id: editingUser.id, userData: updateData });
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'superadmin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manager':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'user':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'superadmin':
        return <Crown className="h-3 w-3" />;
      case 'admin':
        return <Settings className="h-3 w-3" />;
      case 'manager':
        return <Eye className="h-3 w-3" />;
      case 'user':
        return <User className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  Kelola pengguna dan peran mereka di seluruh perusahaan
                </p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                                 <Button className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
                   <UserPlus className="h-4 w-4" />
                   Tambah User
                 </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                                         <Input
                       id="username"
                       value={formData.username}
                       onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                       placeholder="Enter username"
                       className="cursor-text"
                     />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                                         <Input
                       id="email"
                       type="email"
                       value={formData.email}
                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                       placeholder="Enter email"
                       className="cursor-text"
                     />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                                         <Input
                       id="password"
                       type="password"
                       value={formData.password}
                       onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                       placeholder="Enter password"
                       className="cursor-text"
                     />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="full_name">Full Name</Label>
                                         <Input
                       id="full_name"
                       value={formData.full_name}
                       onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                       placeholder="Enter full name"
                       className="cursor-text"
                     />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user" className="cursor-pointer">User</SelectItem>
                        <SelectItem value="admin" className="cursor-pointer">Admin</SelectItem>
                        <SelectItem value="superadmin" className="cursor-pointer">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company</Label>
                    <Select 
                      value={formData.company_id?.toString() || 'no-company'} 
                      onValueChange={(value) => setFormData({ ...formData, company_id: value === 'no-company' ? undefined : parseInt(value) })}
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select company (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-company" className="cursor-pointer">No Company (System User)</SelectItem>
                        {companies?.map((company: any) => (
                          <SelectItem key={company.id} value={company.id.toString()} className="cursor-pointer">
                            {company.name} ({company.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                                 <DialogFooter>
                   <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="cursor-pointer">
                     Cancel
                   </Button>
                   <Button onClick={handleCreateUser} disabled={createUserMutation.isPending} className="cursor-pointer">
                     {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                   </Button>
                 </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari pengguna berdasarkan nama, email, atau username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-200 focus:border-primary focus:ring-primary cursor-text"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48 h-11 cursor-pointer">
                  <SelectValue placeholder="Filter berdasarkan peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-roles" className="cursor-pointer">Semua Peran</SelectItem>
                  <SelectItem value="user" className="cursor-pointer">User</SelectItem>
                  <SelectItem value="admin" className="cursor-pointer">Admin</SelectItem>
                  <SelectItem value="superadmin" className="cursor-pointer">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 px-6 pt-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100">
                <TabsTrigger value="grouped" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">
                  <Building2 className="h-4 w-4" />
                  Berdasarkan Perusahaan
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm cursor-pointer">
                  <Users className="h-4 w-4" />
                  Semua Pengguna
                </TabsTrigger>
              </TabsList>
            </div>
        
                         <TabsContent value="grouped" className="p-6">
               {groupedError ? (
                 <div className="text-center py-12">
                   <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                     <Shield className="h-12 w-12 text-red-400" />
                   </div>
                   <h3 className="text-xl font-semibold mb-2 text-red-600">Error Loading Users</h3>
                   <p className="text-muted-foreground mb-4">{groupedError.message}</p>
                   <Button onClick={() => window.location.reload()} variant="outline">
                     Refresh Page
                   </Button>
                 </div>
               ) : isLoadingGrouped ? (
                 <div className="flex items-center justify-center py-12">
                   <div className="text-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                     <p className="text-muted-foreground text-lg">Memuat data pengguna...</p>
                   </div>
                 </div>
               ) : (
                <div className="space-y-6">
                  {/* System Users */}
                  {groupedData?.systemUsers?.length > 0 && (
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-lg">
                              <Shield className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold text-gray-900">System Users</CardTitle>
                              <CardDescription className="text-sm font-medium text-gray-600">
                                Pengguna tanpa perusahaan (biasanya superadmin)
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200 px-3 py-1">
                            {groupedData.systemUsers.length} pengguna
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                                                     {groupedData.systemUsers.map((user: User) => (
                             <div key={user.id} className="p-6 hover:bg-gray-50/50 transition-all duration-200 group cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <Avatar className="h-12 w-12 border-2 border-gray-200">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`} />
                                    <AvatarFallback className="bg-red-100 text-red-600 font-semibold">
                                      {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold text-gray-900 text-lg">{user.full_name}</span>
                                      <Badge className={getRoleBadgeColor(user.role)}>
                                        {getRoleIcon(user.role)}
                                        <span className="ml-1">{user.role}</span>
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        <span>{user.email}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        <span>@{user.username}</span>
                                      </div>
                                      {user.last_login && (
                                        <div className="flex items-center gap-1">
                                          <Activity className="h-3 w-3" />
                                          <span>Terakhir login: {new Date(user.last_login).toLocaleDateString('id-ID')}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleEditUser(user)}
                                    className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={user.id === currentUser.id}
                                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Companies with Users */}
                  {groupedData?.companies?.map((company: Company) => (
                    <Card key={company.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                      <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-50 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold text-gray-900">{company.name}</CardTitle>
                              <CardDescription className="text-sm font-medium text-gray-600">{company.code}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                            {company.userCount} {company.userCount === 1 ? 'pengguna' : 'pengguna'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        {company.users.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-muted-foreground">Tidak ada pengguna di perusahaan ini</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {company.users.map((user: User) => (
                              <div key={user.id} className="p-6 hover:bg-gray-50/50 transition-all duration-200 group cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-gray-200">
                                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`} />
                                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-900 text-lg">{user.full_name}</span>
                                        <Badge className={getRoleBadgeColor(user.role)}>
                                          {getRoleIcon(user.role)}
                                          <span className="ml-1">{user.role}</span>
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                          <Mail className="h-3 w-3" />
                                          <span>{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          <span>@{user.username}</span>
                                        </div>
                                        {user.last_login && (
                                          <div className="flex items-center gap-1">
                                            <Activity className="h-3 w-3" />
                                            <span>Terakhir login: {new Date(user.last_login).toLocaleDateString('id-ID')}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleEditUser(user)}
                                      className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 cursor-pointer"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleDeleteUser(user.id)}
                                      disabled={user.id === currentUser.id}
                                      className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
                         <TabsContent value="all" className="p-6">
               {allUsersError ? (
                 <div className="text-center py-12">
                   <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                     <Shield className="h-12 w-12 text-red-400" />
                   </div>
                   <h3 className="text-xl font-semibold mb-2 text-red-600">Error Loading Users</h3>
                   <p className="text-muted-foreground mb-4">{allUsersError.message}</p>
                   <Button onClick={() => window.location.reload()} variant="outline">
                     Refresh Page
                   </Button>
                 </div>
               ) : isLoadingAll ? (
                 <div className="flex items-center justify-center py-12">
                   <div className="text-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                     <p className="text-muted-foreground text-lg">Memuat data pengguna...</p>
                   </div>
                 </div>
               ) : allUsersData?.users?.length === 0 ? (
                 <div className="text-center py-12">
                   <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                     <Users className="h-12 w-12 text-gray-400" />
                   </div>
                   <h3 className="text-xl font-semibold mb-2">Tidak ada pengguna ditemukan</h3>
                   <p className="text-muted-foreground">Tidak ada pengguna yang sesuai dengan kriteria pencarian Anda.</p>
                 </div>
               ) : (
                <Card className="overflow-hidden border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <Users className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Semua Pengguna</CardTitle>
                        <CardDescription className="text-sm font-medium text-gray-600">
                          Total {allUsersData?.users?.length} pengguna terdaftar
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                              Pengguna
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                              Perusahaan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                              Terakhir Login
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allUsersData?.users?.map((user: User) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-all duration-200 group cursor-pointer">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Avatar className="h-10 w-10 border-2 border-gray-200">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                      {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {user.email}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      @{user.username}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={getRoleBadgeColor(user.role)}>
                                  {getRoleIcon(user.role)}
                                  <span className="ml-1">{user.role}</span>
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {user.company ? (
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3 text-gray-500" />
                                    {user.company.name}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">System User</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.last_login ? (
                                  <div className="flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    {new Date(user.last_login).toLocaleDateString('id-ID')}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Belum pernah login</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleEditUser(user)}
                                    className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={user.id === currentUser.id}
                                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                  className="cursor-text"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                  className="cursor-text"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">Password</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty to keep current password"
                  className="cursor-text"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-full_name">Full Name</Label>
                <Input
                  id="edit-full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full name"
                  className="cursor-text"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user" className="cursor-pointer">User</SelectItem>
                    <SelectItem value="admin" className="cursor-pointer">Admin</SelectItem>
                    <SelectItem value="superadmin" className="cursor-pointer">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-company">Company</Label>
                <Select 
                  value={formData.company_id?.toString() || 'no-company'} 
                  onValueChange={(value) => setFormData({ ...formData, company_id: value === 'no-company' ? undefined : parseInt(value) })}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select company (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-company" className="cursor-pointer">No Company (System User)</SelectItem>
                    {companies?.map((company: any) => (
                      <SelectItem key={company.id} value={company.id.toString()} className="cursor-pointer">
                        {company.name} ({company.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
                         <DialogFooter>
               <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="cursor-pointer">
                 Cancel
               </Button>
               <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending} className="cursor-pointer">
                 {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
               </Button>
             </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserManagement;
