import React, { useState } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  Button, Chip, TextField, Dialog, DialogTitle, DialogContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { vulnApi } from '../services/api';

const Vulnerabilities = () => {
  const [open, setOpen] = useState(false);
  const [editingVuln, setEditingVuln] = useState(null);
  const [formData, setFormData] = useState({
    targetId: '',
    title: '',
    severity: 'Medium',
    cweId: '',
    description: '',
    poc: '',
    status: 'open'
  });
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    targetId: ''
  });

  const queryClient = useQueryClient();

  const { data: vulnerabilities, isLoading } = useQuery(
    ['vulnerabilities', filters],
    () => vulnApi.getAll(filters)
  );

  const { data: targets } = useQuery('targets', () => 
    fetch('/api/targets').then(res => res.json())
  );

  const createMutation = useMutation(vulnApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('vulnerabilities');
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation(({ id, data }) => vulnApi.update(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries('vulnerabilities');
      setEditingVuln(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation(vulnApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('vulnerabilities');
    },
  });

  const resetForm = () => {
    setFormData({
      targetId: '',
      title: '',
      severity: 'Medium',
      cweId: '',
      description: '',
      poc: '',
      status: 'open'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingVuln) {
      updateMutation.mutate({ id: editingVuln.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (vuln) => {
    setEditingVuln(vuln);
    setFormData({
      targetId: vuln.target_id,
      title: vuln.title,
      severity: vuln.severity,
      cweId: vuln.cwe_id || '',
      description: vuln.description,
      poc: vuln.poc || '',
      status: vuln.status
    });
    setOpen(true);
  };

  const handleDelete = (vulnId) => {
    if (window.confirm('Are you sure you want to delete this vulnerability?')) {
      deleteMutation.mutate(vulnId);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ color: '#00ff41' }}>
          🔍 Vulnerabilities
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingVuln(null);
            resetForm();
            setOpen(true);
          }}
          sx={{ 
            backgroundColor: '#00ff41',
            color: '#000',
            '&:hover': { backgroundColor: '#00cc33' }
          }}
        >
          Add Vulnerability
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#00ff41' }}>Severity</InputLabel>
            <Select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              label="Severity"
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' }
              }}
            >
              <MenuItem value="">All Severities</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#00ff41' }}>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              label="Status"
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' }
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#00ff41' }}>Target</InputLabel>
            <Select
              value={filters.targetId}
              onChange={(e) => setFilters({ ...filters, targetId: e.target.value })}
              label="Target"
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' }
              }}
            >
              <MenuItem value="">All Targets</MenuItem>
              {targets?.map((target) => (
                <MenuItem key={target.id} value={target.id}>
                  {target.name || target.domain}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>
            Vulnerability List ({vulnerabilities?.length || 0})
          </Typography>
          
          <TableContainer component={Paper} sx={{ bgcolor: '#0a0a0a' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#00ff41' }}>Title</TableCell>
                  <TableCell sx={{ color: '#00ff41' }}>Target</TableCell>
                  <TableCell sx={{ color: '#00ff41' }}>Severity</TableCell>
                  <TableCell sx={{ color: '#00ff41' }}>CWE</TableCell>
                  <TableCell sx={{ color: '#00ff41' }}>Status</TableCell>
                  <TableCell sx={{ color: '#00ff41' }}>Date</TableCell>
                  <TableCell sx={{ color: '#00ff41' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vulnerabilities?.map((vuln) => {
                  const target = targets?.find(t => t.id === vuln.target_id);
                  return (
                    <TableRow key={vuln.id}>
                      <TableCell sx={{ color: '#fff' }}>{vuln.title}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>
                        {target?.name || target?.domain || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={vuln.severity}
                          color={getSeverityColor(vuln.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#fff' }}>{vuln.cwe_id || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={vuln.status}
                          color={getStatusColor(vuln.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#fff' }}>
                        {new Date(vuln.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(vuln)}
                            sx={{ 
                              borderColor: '#00ff41', 
                              color: '#00ff41',
                              '&:hover': { borderColor: '#00cc33', backgroundColor: '#00ff4133' }
                            }}
                            variant="outlined"
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(vuln.id)}
                            sx={{ 
                              borderColor: '#f44336', 
                              color: '#f44336',
                              '&:hover': { borderColor: '#d32f2f', backgroundColor: '#f4433633' }
                            }}
                            variant="outlined"
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: '#00ff41' }}>
          {editingVuln ? 'Edit Vulnerability' : 'Add New Vulnerability'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: '#00ff41' }}>Target</InputLabel>
              <Select
                value={formData.targetId}
                onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                label="Target"
                required
                sx={{
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' }
                }}
              >
                {targets?.map((target) => (
                  <MenuItem key={target.id} value={target.id}>
                    {target.name || target.domain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#00ff41' },
                  '&.Mui-focused fieldset': { borderColor: '#00ff41' }
                }
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: '#00ff41' }}>Severity</InputLabel>
              <Select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                label="Severity"
                sx={{
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' }
                }}
              >
                <MenuItem value="Critical">Critical</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="CWE ID"
              value={formData.cweId}
              onChange={(e) => setFormData({ ...formData, cweId: e.target.value })}
              margin="normal"
              placeholder="e.g., CWE-79"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#00ff41' },
                  '&.Mui-focused fieldset': { borderColor: '#00ff41' }
                }
              }}
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#00ff41' },
                  '&.Mui-focused fieldset': { borderColor: '#00ff41' }
                }
              }}
            />

            <TextField
              fullWidth
              label="Proof of Concept"
              value={formData.poc}
              onChange={(e) => setFormData({ ...formData, poc: e.target.value })}
              margin="normal"
              multiline
              rows={6}
              placeholder="Provide detailed steps to reproduce the vulnerability..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#00ff41' },
                  '&.Mui-focused fieldset': { borderColor: '#00ff41' }
                }
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: '#00ff41' }}>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
                sx={{
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' }
                }}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" gap={2} mt={3}>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                sx={{ 
                  backgroundColor: '#00ff41',
                  color: '#000',
                  '&:hover': { backgroundColor: '#00cc33' }
                }}
              >
                {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 
                 editingVuln ? 'Update Vulnerability' : 'Create Vulnerability'}
              </Button>
              <Button onClick={() => setOpen(false)} variant="outlined">
                Cancel
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Vulnerabilities;