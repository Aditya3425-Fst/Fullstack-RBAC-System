import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import './Users.css';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import { formatDate } from '../../utils/formatters';
import { validateName, validateMobile, validateRole } from '../../utils/validators';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import './Users.css';

const ROLE_OPTIONS = Object.values(ROLES).map((r) => ({ value: r, label: ROLE_LABELS[r] }));
const ALL_ROLE_OPTIONS = [{ value: '', label: 'All Roles' }, ...ROLE_OPTIONS];

const INITIAL_FORM = { name: '', mobile: '', role: ROLES.USER, isActive: true };

const Users = () => {
  const { user: currentUser, hasRole } = useAuth();
  const { users, pagination, loading, fetchUsers, createUser, updateRole, removeUser } = useUsers();

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  // Create modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);

  // Role update
  const [editRoleUser, setEditRoleUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);

  // Delete
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = useCallback(() => {
    fetchUsers({ page, limit: 10, search, role: roleFilter });
  }, [page, search, roleFilter, fetchUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const errs = {};
    const nameErr = validateName(form.name);
    const mobileErr = validateMobile(form.mobile);
    const roleErr = validateRole(form.role, Object.values(ROLES));
    if (nameErr) errs.name = nameErr;
    if (mobileErr) errs.mobile = mobileErr;
    if (roleErr) errs.role = roleErr;
    return errs;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setCreating(true);
    const result = await createUser(form);
    setCreating(false);
    if (result.success) {
      setCreateModalOpen(false);
      setForm(INITIAL_FORM);
      setFormErrors({});
      loadUsers();
    }
  };

  const handleUpdateRole = async () => {
    if (!newRole || !editRoleUser) return;
    setUpdatingRole(true);
    const result = await updateRole(editRoleUser._id, newRole);
    setUpdatingRole(false);
    if (result.success) {
      setEditRoleUser(null);
      setNewRole('');
      loadUsers();
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    const result = await removeUser(deleteUser._id);
    setDeleting(false);
    if (result.success) {
      setDeleteUser(null);
      loadUsers();
    }
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage user accounts and permissions</p>
        </div>
        {hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN) && (
          <Button onClick={() => setCreateModalOpen(true)}>
            + Create User
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="card users-filters">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or mobile..."
        />
        <Select
          id="role-filter"
          options={ALL_ROLE_OPTIONS}
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          placeholder="All Roles"
          className="filter-select"
        />
        <span className="results-count">
          {pagination.total} user{pagination.total !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <Loader center text="Loading users..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No users found"
            description={search ? `No results for "${search}"` : 'No users match the current filters.'}
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    {hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN) && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={u._id}>
                      <td className="text-muted text-sm">
                        {(pagination.page - 1) * pagination.limit + idx + 1}
                      </td>
                      <td>
                        <div className="user-cell">
                          <div className="user-cell-avatar">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{u.name}</span>
                          {u._id === currentUser?._id && (
                            <span className="you-badge">You</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}>
                          {u.mobile}
                        </span>
                      </td>
                      <td>
                        <span className={`role-badge role-${u.role}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-sm text-muted">{formatDate(u.createdAt)}</td>
                      {hasRole(ROLES.SUPER_ADMIN, ROLES.ADMIN) && (
                        <td>
                          <div className="action-buttons">
                            {hasRole(ROLES.SUPER_ADMIN) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setEditRoleUser(u); setNewRole(u.role); }}
                                aria-label={`Edit role for ${u.name}`}
                              >
                                ✏️ Role
                              </Button>
                            )}
                            {hasRole(ROLES.SUPER_ADMIN) && u._id !== currentUser?._id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteUser(u)}
                                style={{ color: 'var(--color-danger)' }}
                                aria-label={`Delete ${u.name}`}
                              >
                                🗑️ Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setForm(INITIAL_FORM); setFormErrors({}); }}
        title="Create New User"
      >
        <form onSubmit={handleCreate} noValidate>
          <Input
            id="create-name"
            label="Full Name"
            placeholder="Enter full name"
            value={form.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            error={formErrors.name}
            autoFocus
          />
          <Input
            id="create-mobile"
            label="Mobile Number"
            placeholder="10-digit mobile number"
            value={form.mobile}
            onChange={(e) => handleFormChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
            error={formErrors.mobile}
            inputMode="numeric"
            maxLength={10}
          />
          <Select
            id="create-role"
            label="Role"
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={(e) => handleFormChange('role', e.target.value)}
            error={formErrors.role}
            placeholder="Select a role"
          />
          <div className="form-group">
            <label className="form-label" htmlFor="create-active">Status</label>
            <div className="toggle-wrapper">
              <input
                type="checkbox"
                id="create-active"
                checked={form.isActive}
                onChange={(e) => handleFormChange('isActive', e.target.checked)}
                className="toggle-input"
              />
              <label htmlFor="create-active" className="toggle-label">
                {form.isActive ? 'Active' : 'Inactive'}
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setCreateModalOpen(false); setForm(INITIAL_FORM); setFormErrors({}); }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={!!editRoleUser}
        onClose={() => { setEditRoleUser(null); setNewRole(''); }}
        title="Update User Role"
        size="sm"
      >
        {editRoleUser && (
          <>
            <div className="edit-role-user-info">
              <div className="user-cell">
                <div className="user-cell-avatar">{editRoleUser.name?.charAt(0)}</div>
                <div>
                  <div className="font-medium">{editRoleUser.name}</div>
                  <div className="text-sm text-muted">{editRoleUser.mobile}</div>
                </div>
              </div>
            </div>
            <Select
              id="edit-role"
              label="New Role"
              options={ROLE_OPTIONS}
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Select new role"
            />
            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => { setEditRoleUser(null); setNewRole(''); }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateRole}
                loading={updatingRole}
                disabled={!newRole || newRole === editRoleUser.role}
              >
                Update Role
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteUser?.name}" (${deleteUser?.mobile})? This action cannot be undone.`}
        confirmText="Delete User"
        loading={deleting}
      />
    </div>
  );
};

export default Users;
