import { User, Building2, Shield, Palette, Loader2, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companySettings, setCompanySettings] = useState<{ [key: string]: any }>({});
  const [userSettings, setUserSettings] = useState<{ [key: string]: any }>({});
  const [user, setUser] = useState(null);
  const [companyData, setCompanyData] = useState({
    company_name: '',
    npwp: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });
  const [companyHeader, setCompanyHeader] = useState({
    header_company_name: '',
    header_address: '',
    header_phone: '',
    header_email: ''
  });
  const [userData, setUserData] = useState({
    full_name: '',
    email: '',
    role: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: ''
  });

  // Load settings and user data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user data
      const userResponse = await api.auth.getMe();
      setUser(userResponse.data.user);
      setUserData({
        full_name: userResponse.data.user.full_name || '',
        email: userResponse.data.user.email || '',
        role: userResponse.data.user.role || ''
      });

      // Load company settings
      const companyResponse = await api.settings.getCompanySettings();
      const companySettingsMap: { [key: string]: any } = {};
      
      // Check if user has company_id (not superadmin)
      if (userResponse.data.user.company_id) {
        companyResponse.data.settings.forEach(setting => {
          companySettingsMap[setting.key] = setting.value;
        });
      }
      
      setCompanySettings(companySettingsMap);
      
      // Set company data from settings
      setCompanyData({
        company_name: companySettingsMap.company_name || '',
        npwp: companySettingsMap.npwp || '',
        address: companySettingsMap.address || '',
        phone: companySettingsMap.phone || '',
        email: companySettingsMap.email || '',
        website: companySettingsMap.website || ''
      });
      
      // Set company header data from settings
      setCompanyHeader({
        header_company_name: companySettingsMap.header_company_name || '',
        header_address: companySettingsMap.header_address || '',
        header_phone: companySettingsMap.header_phone || '',
        header_email: companySettingsMap.header_email || ''
      });

      // Load user settings
      const userResponse2 = await api.settings.getUserSettings();
      const userSettingsMap: { [key: string]: any } = {};
      userResponse2.data.settings.forEach(setting => {
        userSettingsMap[setting.key] = setting.value;
      });
      setUserSettings(userSettingsMap);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data pengaturan: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async () => {
    try {
      setLoading(true);
      
      // Update each company setting
      await Promise.all([
        api.settings.updateCompanySetting('company_name', companyData.company_name),
        api.settings.updateCompanySetting('npwp', companyData.npwp),
        api.settings.updateCompanySetting('address', companyData.address),
        api.settings.updateCompanySetting('phone', companyData.phone),
        api.settings.updateCompanySetting('email', companyData.email),
        api.settings.updateCompanySetting('website', companyData.website)
      ]);
      
      toast({
        title: "Berhasil",
        description: "Pengaturan perusahaan berhasil disimpan"
      });
      
      // Reload data
      await loadData();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan perusahaan: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyHeaderSubmit = async () => {
    try {
      setLoading(true);
      
      // Update each company header setting
      await Promise.all([
        api.settings.updateCompanySetting('header_company_name', companyHeader.header_company_name),
        api.settings.updateCompanySetting('header_address', companyHeader.header_address),
        api.settings.updateCompanySetting('header_phone', companyHeader.header_phone),
        api.settings.updateCompanySetting('header_email', companyHeader.header_email)
      ]);
      
      toast({
        title: "Berhasil",
        description: "Kop surat berhasil disimpan"
      });
      
      // Reload data
      await loadData();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan kop surat: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async () => {
    try {
      setLoading(true);
      
      // Update user settings
      await Promise.all([
        api.settings.updateUserSetting('full_name', userData.full_name),
        api.settings.updateUserSetting('email', userData.email)
      ]);
      
      toast({
        title: "Berhasil",
        description: "Profil pengguna berhasil diperbarui"
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui profil: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      toast({
        title: "Error",
        description: "Harap isi password saat ini dan password baru",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Update password via user settings
      await api.settings.updateUserSetting('password_change', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      }, 'json');
      
      toast({
        title: "Berhasil",
        description: "Password berhasil diubah"
      });
      
      // Clear password fields
      setPasswordData({ current_password: '', new_password: '' });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengubah password: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pengaturan</h1>
          <p className="text-muted-foreground">Kelola profil perusahaan dan preferensi aplikasi</p>
        </div>

        <div className="space-y-6">
          {/* Company Profile */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Profil Perusahaan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user?.company_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">Superadmin Mode</h4>
                      <p className="text-sm text-blue-700">
                        Anda login sebagai Superadmin. Pengaturan perusahaan hanya dapat diubah oleh Admin perusahaan masing-masing.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nama Perusahaan</Label>
                  <Input 
                    id="company-name" 
                    value={companyData.company_name}
                    onChange={(e) => setCompanyData({...companyData, company_name: e.target.value})}
                    disabled={!user?.company_id}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="npwp">NPWP</Label>
                  <Input 
                    id="npwp" 
                    value={companyData.npwp}
                    onChange={(e) => setCompanyData({...companyData, npwp: e.target.value})}
                    disabled={!user?.company_id}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea 
                  id="address" 
                  value={companyData.address}
                  onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                  rows={3}
                  disabled={!user?.company_id}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input 
                    id="phone" 
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                    disabled={!user?.company_id}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={companyData.email}
                    onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                    disabled={!user?.company_id}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    type="url" 
                    value={companyData.website}
                    onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                    placeholder="https://example.com"
                    disabled={!user?.company_id}
                  />
                </div>
              </div>

              <Button 
                className="bg-gradient-primary" 
                onClick={handleCompanySubmit}
                disabled={loading || !user?.company_id}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {!user?.company_id ? 'Hanya untuk Admin Perusahaan' : 'Simpan Perubahan'}
              </Button>
            </CardContent>
          </Card>

          {/* Company Header for Reports */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Kop Surat Laporan</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Pengaturan kop surat yang akan muncul di semua laporan PDF. Kosongkan jika ingin menggunakan data perusahaan default.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="header-company-name">Nama Perusahaan (Kop)</Label>
                  <Input 
                    id="header-company-name" 
                    value={companyHeader.header_company_name}
                    onChange={(e) => setCompanyHeader({...companyHeader, header_company_name: e.target.value})}
                    placeholder="Kosongkan untuk menggunakan nama perusahaan default"
                    disabled={!user?.company_id}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="header-email">Email (Kop)</Label>
                  <Input 
                    id="header-email" 
                    type="email" 
                    value={companyHeader.header_email}
                    onChange={(e) => setCompanyHeader({...companyHeader, header_email: e.target.value})}
                    placeholder="Kosongkan untuk menggunakan email default"
                    disabled={!user?.company_id}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="header-address">Alamat (Kop)</Label>
                <Textarea 
                  id="header-address" 
                  value={companyHeader.header_address}
                  onChange={(e) => setCompanyHeader({...companyHeader, header_address: e.target.value})}
                  rows={3}
                  placeholder="Kosongkan untuk menggunakan alamat default"
                  disabled={!user?.company_id}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="header-phone">Nomor Telepon (Kop)</Label>
                <Input 
                  id="header-phone" 
                  value={companyHeader.header_phone}
                  onChange={(e) => setCompanyHeader({...companyHeader, header_phone: e.target.value})}
                  placeholder="Kosongkan untuk menggunakan telepon default"
                  disabled={!user?.company_id}
                />
              </div>

              <Button 
                className="bg-gradient-primary" 
                onClick={handleCompanyHeaderSubmit}
                disabled={loading || !user?.company_id}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {!user?.company_id ? 'Hanya untuk Admin Perusahaan' : 'Simpan Kop Surat'}
              </Button>
            </CardContent>
          </Card>

          {/* User Profile */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profil Pengguna</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Nama Lengkap</Label>
                  <Input 
                    id="user-name" 
                    value={userData.full_name}
                    onChange={(e) => setUserData({...userData, full_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email</Label>
                  <Input 
                    id="user-email" 
                    type="email" 
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={userData.role} disabled />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Ubah Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Password Saat Ini</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password Baru</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePasswordChange}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Ubah Password
                </Button>
              </div>

              <Button 
                variant="outline" 
                onClick={handleUserSubmit}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Profil
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Keamanan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Tambahkan lapisan keamanan ekstra</p>
                </div>
                <Button variant="outline" size="sm">
                  Aktifkan
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Backup Otomatis</h4>
                  <p className="text-sm text-muted-foreground">Backup data secara otomatis setiap hari</p>
                </div>
                <Button variant="outline" size="sm">
                  Konfigurasi
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* App Preferences */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Preferensi Aplikasi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Format Mata Uang</h4>
                  <p className="text-sm text-muted-foreground">Rupiah (IDR)</p>
                </div>
                <Button variant="outline" size="sm">
                  Ubah
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Bahasa</h4>
                  <p className="text-sm text-muted-foreground">Bahasa Indonesia</p>
                </div>
                <Button variant="outline" size="sm">
                  Ubah
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Notifikasi Email</h4>
                  <p className="text-sm text-muted-foreground">Terima notifikasi untuk transaksi penting</p>
                </div>
                <Button variant="outline" size="sm">
                  Konfigurasi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;