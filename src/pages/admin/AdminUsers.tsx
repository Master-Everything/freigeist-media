import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Check, KeyRound, Loader2, MailCheck, Trash2, UserPlus } from "lucide-react";

interface UserEntry {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
}

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserEntry | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingRoleFor, setSavingRoleFor] = useState<string | null>(null);

  // Admin access check
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Create user state
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("none");
  const [creating, setCreating] = useState(false);

  // Delete user state
  const [deleteTarget, setDeleteTarget] = useState<UserEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Confirm email state
  const [confirmingEmailFor, setConfirmingEmailFor] = useState<string | null>(null);

  // Inline display name editing
  const [editingDisplayName, setEditingDisplayName] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAdmin(false);
        return;
      }
      setCurrentUserId(session.user.id);
      const { data } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin" as const,
      });
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-list-users");
    if (error) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } else {
      setUsers(data.users ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const handleSetPassword = async () => {
    if (!selectedUser) return;
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { data, error } = await supabase.functions.invoke("admin-set-password", {
      body: { user_id: selectedUser.id, password },
    });

    if (error || data?.error) {
      toast({ title: "Error", description: data?.error ?? "Failed to set password", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Password updated for ${selectedUser.email}` });
      setSelectedUser(null);
    }
    setPassword("");
    setConfirmPassword("");
    setSaving(false);
  };

  const handleSetRole = async (userId: string, role: string) => {
    setSavingRoleFor(userId);
    const { data, error } = await supabase.functions.invoke("admin-set-role", {
      body: { user_id: userId, role: role === "none" ? null : role },
    });

    if (error || data?.error) {
      toast({ title: "Error", description: data?.error ?? "Failed to set role", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Role updated" });
      await fetchUsers();
    }
    setSavingRoleFor(null);
  };

  const handleCreateUser = async () => {
    if (!newEmail.trim()) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" });
      return;
    }

    setCreating(true);
    const { data, error } = await supabase.functions.invoke("admin-create-user", {
      body: { email: newEmail.trim(), role: newRole === "none" ? null : newRole },
    });

    if (error || data?.error) {
      toast({ title: "Error", description: data?.error ?? "Failed to create user", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Invite sent to ${newEmail.trim()}` });
      setCreateOpen(false);
      setNewEmail("");
      setNewRole("none");
      await fetchUsers();
    }
    setCreating(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { data, error } = await supabase.functions.invoke("admin-delete-user", {
      body: { user_id: deleteTarget.id },
    });

    if (error || data?.error) {
      toast({ title: "Error", description: data?.error ?? "Failed to delete user", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `User ${deleteTarget.email} deleted` });
      await fetchUsers();
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  const handleConfirmEmail = async (user: UserEntry) => {
    setConfirmingEmailFor(user.id);
    const { data, error } = await supabase.functions.invoke("admin-set-password", {
      body: { user_id: user.id, confirm_email: true },
    });

    if (error || data?.error) {
      toast({ title: "Error", description: data?.error ?? "Failed to confirm email", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Email confirmed for ${user.email}` });
    }
    setConfirmingEmailFor(null);
  };

  const handleSaveDisplayName = async (userId: string) => {
    const newName = editingDisplayName[userId];
    if (newName === undefined) return;
    const { data, error } = await supabase.functions.invoke("admin-update-profile", {
      body: { user_id: userId, display_name: newName },
    });
    if (error || data?.error) {
      toast({ title: "Error", description: data?.error ?? "Failed to update display name", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Display name updated" });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, display_name: newName.trim() } : u));
    }
    setEditingDisplayName((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  // Loading admin check
  if (isAdmin === null) {
    return (
      <AdminLayout>
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="animate-spin" size={18} /> Loading…
        </div>
      </AdminLayout>
    );
  }

  // Not admin → redirect
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-ui text-2xl font-bold">Users</h1>
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus size={16} /> Create User
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
            <Loader2 className="animate-spin" size={18} /> Loading users…
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Input
                        className="h-8 text-xs w-[150px]"
                        value={editingDisplayName[u.id] !== undefined ? editingDisplayName[u.id] : u.display_name}
                        onChange={(e) => setEditingDisplayName((prev) => ({ ...prev, [u.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveDisplayName(u.id); }}
                        onBlur={() => {
                          if (editingDisplayName[u.id] !== undefined && editingDisplayName[u.id].trim() !== u.display_name) {
                            handleSaveDisplayName(u.id);
                          } else {
                            setEditingDisplayName((prev) => {
                              const next = { ...prev };
                              delete next[u.id];
                              return next;
                            });
                          }
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={u.roles[0] ?? "none"}
                        onValueChange={(val) => handleSetRole(u.id, val)}
                        disabled={savingRoleFor === u.id}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editorial_manager">Editorial Manager</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="none">No role</SelectItem>
                        </SelectContent>
                      </Select>
                      {savingRoleFor === u.id && <Loader2 className="animate-spin" size={14} />}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmEmail(u)}
                        disabled={confirmingEmailFor === u.id}
                        title="Confirm Email"
                      >
                        {confirmingEmailFor === u.id ? <Loader2 className="animate-spin" size={14} /> : <MailCheck size={14} />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedUser(u)}>
                        <KeyRound size={14} /> Set Password
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(u)}
                        disabled={u.id === currentUserId}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Set Password Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => { if (!open) { setSelectedUser(null); setPassword(""); setConfirmPassword(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Password</DialogTitle>
            <DialogDescription>Set a new password for {selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
            <Button onClick={handleSetPassword} disabled={saving}>
              {saving && <Loader2 className="animate-spin" size={14} />}
              Set Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) { setCreateOpen(false); setNewEmail(""); setNewRole("none"); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>An invite email will be sent. The user must set their password on first login.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input id="create-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Role (optional)</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editorial_manager">Editorial Manager</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser} disabled={creating}>
              {creating && <Loader2 className="animate-spin" size={14} />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.email}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting && <Loader2 className="animate-spin" size={14} />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminUsers;
