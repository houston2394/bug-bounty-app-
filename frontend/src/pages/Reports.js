import React, { useState } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  Button, Chip, Dialog, DialogTitle, DialogContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { reportsApi } from '../services/api';

const Reports = () => {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    targetId: '',
    template: 'vulnerability'
  });

  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery('reports', reportsApi.getAll);

  const { data: targets } = useQuery('targets', () => 
    fetch('/api/targets').then(res => res.json())
  );

  const generateMutation = useMutation(({ targetId, template }) => 
    reportsApi.generate(targetId, template), {
    onSuccess: () => {
      queryClient.invalidateQueries('reports');
      setOpen(false);
      setGenerating(false);
    },
    onError: () => {
      setGenerating(false);
    }
  });

  const deleteMutation = useMutation(reportsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('reports');
    },
  });

  const handleGenerate = async () => {
    if (!formData.targetId) return;
    
    setGenerating(true);
    try {
      await generateMutation.mutateAsync({ 
        targetId: formData.targetId, 
        template: formData.template 
      });
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleExport = async (reportId, format) => {
    try {
      const response = await reportsApi.export(reportId, format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const handleDelete = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      deleteMutation.mutate(reportId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'success';
      case 'draft': return 'warning';
      case 'approved': return 'info';
      default: return 'default';
    }
  };

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ color: '#00ff41' }}>
          📄 Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ 
            backgroundColor: '#00ff41',
            color: '#000',
            '&:hover': { backgroundColor: '#00cc33' }
          }}
        >
          Generate Report
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>
                Report Statistics
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Reports
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#00ff41' }}>
                    {reports?.length || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Draft Reports
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#ff9800' }}>
                    {reports?.filter(r => r.status === 'draft').length || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Submitted Reports
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#4caf50' }}>
                    {reports?.filter(r => r.status === 'submitted').length || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>
                Recent Reports
              </Typography>
              
              <TableContainer component={Paper} sx={{ bgcolor: '#0a0a0a' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#00ff41' }}>Title</TableCell>
                      <TableCell sx={{ color: '#00ff41' }}>Target</TableCell>
                      <TableCell sx={{ color: '#00ff41' }}>Status</TableCell>
                      <TableCell sx={{ color: '#00ff41' }}>Created</TableCell>
                      <TableCell sx={{ color: '#00ff41' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports?.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell sx={{ color: '#fff' }}>{report.title}</TableCell>
                        <TableCell sx={{ color: '#fff' }}>{report.target_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={report.status}
                            color={getStatusColor(report.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#fff' }}>
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => {
                                // TODO: Implement view report functionality
                                alert('View functionality coming soon!');
                              }}
                              sx={{ 
                                borderColor: '#00ff41', 
                                color: '#00ff41',
                                '&:hover': { borderColor: '#00cc33', backgroundColor: '#00ff4133' }
                              }}
                              variant="outlined"
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={() => handleExport(report.id, 'md')}
                              sx={{ 
                                borderColor: '#2196f3', 
                                color: '#2196f3',
                                '&:hover': { borderColor: '#1976d2', backgroundColor: '#2196f333' }
                              }}
                              variant="outlined"
                            >
                              Export
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(report.id)}
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
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#00ff41' }}>Generate New Report</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
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

            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: '#00ff41' }}>Report Template</InputLabel>
              <Select
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                label="Report Template"
                sx={{
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff41' }
                }}
              >
                <MenuItem value="vulnerability">Vulnerability Report</MenuItem>
                <MenuItem value="reconnaissance">Reconnaissance Report</MenuItem>
                <MenuItem value="executive">Executive Summary</MenuItem>
                <MenuItem value="comprehensive">Comprehensive Report</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" gap={2} mt={3}>
              <Button
                variant="contained"
                disabled={!formData.targetId || generating}
                onClick={handleGenerate}
                sx={{ 
                  backgroundColor: '#00ff41',
                  color: '#000',
                  '&:hover': { backgroundColor: '#00cc33' },
                  '&:disabled': { backgroundColor: '#666', color: '#999' }
                }}
              >
                {generating ? 'Generating...' : 'Generate Report'}
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

export default Reports;