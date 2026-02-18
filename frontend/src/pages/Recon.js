import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  Button, LinearProgress, Chip, Alert, List, ListItem,
  ListItemText, ListItemIcon, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { 
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Terminal as TerminalIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from 'react-query';
import { connectSocket, disconnectSocket, targetsApi, reconApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Recon = () => {
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentJobs, setCurrentJobs] = useState({});
  const [jobOutputs, setJobOutputs] = useState({});
  const [showOutput, setShowOutput] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const { data: targets, isLoading } = useQuery('targets', targetsApi.getAll);
  const { data: allJobs, refetch: refetchJobs } = useQuery('recon-jobs', () => 
    fetch('/api/recon/jobs').then(res => res.json())
  );

  useEffect(() => {
    const newSocket = connectSocket();
    setSocket(newSocket);

    newSocket.on('job-status-update', (data) => {
      setCurrentJobs(prev => ({
        ...prev,
        [data.jobId]: data
      }));
      
      refetchJobs();
    });

    newSocket.on('script-output', (data) => {
      setJobOutputs(prev => ({
        ...prev,
        [data.jobId]: (prev[data.jobId] || '') + data.output
      }));
    });

    newSocket.on('script-error', (data) => {
      setJobOutputs(prev => ({
        ...prev,
        [data.jobId]: (prev[data.jobId] || '') + `ERROR: ${data.error}`
      }));
    });

    return () => disconnectSocket();
  }, [refetchJobs]);

  const passiveScanMutation = useMutation(
    (targetId) => reconApi.runPassive(targetId),
    {
      onSuccess: (data) => {
        setCurrentJobs(prev => ({
          ...prev,
          [data.jobId]: { jobId: data.jobId, status: 'running' }
        }));
      }
    }
  );

  const activeScanMutation = useMutation(
    (targetId) => reconApi.runActive(targetId),
    {
      onSuccess: (data) => {
        setCurrentJobs(prev => ({
          ...prev,
          [data.jobId]: { jobId: data.jobId, status: 'running' }
        }));
      }
    }
  );

  const quickScanMutation = useMutation(
    (targetId) => reconApi.runQuickScan(targetId),
    {
      onSuccess: (data) => {
        setCurrentJobs(prev => ({
          ...prev,
          [data.jobId]: { jobId: data.jobId, status: 'running' }
        }));
      }
    }
  );

  const handleScan = async (targetId, scanType) => {
    try {
      let mutation;
      switch (scanType) {
        case 'passive':
          mutation = passiveScanMutation;
          break;
        case 'active':
          mutation = activeScanMutation;
          break;
        case 'quick-scan':
          mutation = quickScanMutation;
          break;
        default:
          return;
      }
      
      await mutation.mutateAsync(targetId);
    } catch (error) {
      console.error('Scan error:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckIcon sx={{ color: '#4caf50' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'running':
        return <ScheduleIcon sx={{ color: '#ff9800' }} />;
      default:
        return <ScheduleIcon sx={{ color: '#666' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (isLoading) return <LinearProgress />;

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ color: '#00ff41', mb: 4 }}>
        <TerminalIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Reconnaissance Control Center
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>
                Available Targets
              </Typography>
              <List>
                {targets?.map((target) => (
                  <ListItem key={target.id} sx={{ border: '1px solid #333', mb: 1, borderRadius: 1 }}>
                    <ListItemText
                      primary={target.name || target.domain}
                      secondary={target.description}
                      primaryTypographyProps={{ sx: { color: '#fff' } }}
                      secondaryTypographyProps={{ sx: { color: '#999' } }}
                    />
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayIcon />}
                        onClick={() => handleScan(target.id, 'passive')}
                        disabled={passiveScanMutation.isLoading}
                        sx={{ 
                          backgroundColor: '#00ff41',
                          color: '#000',
                          '&:hover': { backgroundColor: '#00cc33' },
                          '&:disabled': { backgroundColor: '#666', color: '#999' }
                        }}
                      >
                        Passive
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayIcon />}
                        onClick={() => handleScan(target.id, 'active')}
                        disabled={activeScanMutation.isLoading}
                        sx={{ 
                          backgroundColor: '#ff9800',
                          color: '#000',
                          '&:hover': { backgroundColor: '#f57c00' },
                          '&:disabled': { backgroundColor: '#666', color: '#999' }
                        }}
                      >
                        Active
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayIcon />}
                        onClick={() => handleScan(target.id, 'quick-scan')}
                        disabled={quickScanMutation.isLoading}
                        sx={{ 
                          backgroundColor: '#f44336',
                          color: '#fff',
                          '&:hover': { backgroundColor: '#d32f2f' },
                          '&:disabled': { backgroundColor: '#666', color: '#999' }
                        }}
                      >
                        Quick Scan
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/targets/${target.id}`)}
                        sx={{ 
                          borderColor: '#00ff41', 
                          color: '#00ff41',
                          '&:hover': { borderColor: '#00cc33', backgroundColor: '#00ff4133' }
                        }}
                      >
                        Details
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>
                Quick Statistics
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Targets
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#00ff41' }}>
                    {targets?.length || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Running Jobs
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#ff9800' }}>
                    {Object.values(currentJobs).filter(job => job.status === 'running').length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Completed Today
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#4caf50' }}>
                    {allJobs?.filter(job => job.status === 'completed').length || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ color: '#00ff41' }}>
              Recent Scan Jobs
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={refetchJobs}
              sx={{ 
                borderColor: '#00ff41', 
                color: '#00ff41',
                '&:hover': { borderColor: '#00cc33', backgroundColor: '#00ff4133' }
              }}
              variant="outlined"
            >
              Refresh
            </Button>
          </Box>

          {Object.keys(currentJobs).length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {Object.values(currentJobs).filter(job => job.status === 'running').length} scans currently running
            </Alert>
          )}

          <List>
            {allJobs?.slice(0, 10).map((job) => (
              <ListItem key={job.id} sx={{ border: '1px solid #333', mb: 1, borderRadius: 1 }}>
                <ListItemIcon>
                  {getStatusIcon(job.status)}
                </ListItemIcon>
                <ListItemText
                  primary={`${job.type.toUpperCase()} - ${job.id}`}
                  secondary={`Started: ${new Date(job.started_at).toLocaleString()}`}
                  primaryTypographyProps={{ sx: { color: '#fff' } }}
                  secondaryTypographyProps={{ sx: { color: '#999' } }}
                />
                <Chip
                  label={job.status}
                  color={getStatusColor(job.status)}
                  size="small"
                  sx={{ mr: 1 }}
                />
                {jobOutputs[job.id] && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedJob(job);
                      setShowOutput(true);
                    }}
                    sx={{ 
                      borderColor: '#00ff41', 
                      color: '#00ff41',
                      '&:hover': { borderColor: '#00cc33', backgroundColor: '#00ff4133' }
                    }}
                  >
                    View Output
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog 
        open={showOutput} 
        onClose={() => setShowOutput(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: '#00ff41' }}>
          Scan Output - {selectedJob?.type?.toUpperCase()}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              bgcolor: '#000',
              p: 2,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              height: 400,
              overflow: 'auto',
              color: '#00ff41',
              border: '1px solid #333'
            }}
          >
            {selectedJob && jobOutputs[selectedJob.id] || 'No output available for this job.'}
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Recon;