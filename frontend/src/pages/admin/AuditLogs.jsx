import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import {
  FileText,
  Search,
  User,
  Clock,
  Globe,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import RetryState from '../../components/ui/RetryState';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/admin/audit-logs?page=${page}&limit=15&search=${searchQuery}`);
      setLogs(res.data.data.logs || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchAuditLogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full py-4 sm:py-6">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
          Administrative Audit Trail Logs
        </h1>
        <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
          Complete compliance trail of all administrative actions, user blocks, verification approvals, and settings changes.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="p-4 sm:p-6 shadow-soft border-border-light rounded-[24px] bg-white">
        <div className="relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search audit logs by action, admin name, or target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="shadow-soft border-border-light rounded-[24px] overflow-hidden bg-white">
        {loading ? (
          <div className="p-8">
            <Skeleton className="h-12 w-full mb-4 rounded-xl" />
            <Skeleton className="h-12 w-full mb-4 rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : error ? (
          <RetryState error={error} onRetry={fetchAuditLogs} />
        ) : logs.length === 0 ? (
          <EmptyState
            title="No Audit Logs Recorded"
            description="Administrative operations will appear here as they are performed."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Action</Table.Head>
                  <Table.Head>Admin User</Table.Head>
                  <Table.Head>Target Entity</Table.Head>
                  <Table.Head>Details</Table.Head>
                  <Table.Head>IP Address</Table.Head>
                  <Table.Head>Timestamp</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {logs.map((l) => (
                  <Table.Row key={l._id}>
                    <Table.Cell>
                      <Badge
                        variant={
                          l.action.includes('DELETED') || l.action.includes('BLOCKED')
                            ? 'error'
                            : l.action.includes('VERIFIED') || l.action.includes('APPROVED')
                            ? 'success'
                            : 'primary'
                        }
                      >
                        {l.action}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">
                          {l.admin?.name || 'Administrator'}
                        </span>
                        <span className="text-xs text-text-secondary">{l.admin?.email}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                          {l.targetType}
                        </span>
                        {l.targetId && (
                          <span className="font-mono text-[11px] text-gray-500">
                            ID: #{l.targetId.slice(-6)}
                          </span>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-xs font-medium text-gray-700 max-w-xs truncate block">
                        {l.details ? JSON.stringify(l.details) : 'N/A'}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="font-mono text-xs text-gray-500">
                        {l.ipAddress || '127.0.0.1'}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-xs text-text-secondary font-medium whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditLogs;
