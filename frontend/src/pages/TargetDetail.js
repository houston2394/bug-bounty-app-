import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  Button, Chip, LinearProgress, Tabs, Tab, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  BugReport as BugReportIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from 'react-query';
import { connectSocket, disconnectSocket } from '../services/api';

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const TargetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [socket, setSocket] = useState(null);
  const [currentScan, setCurrentScan] = useState(null);
  const [scanOutput, setScanOutput] = useState('');

  const { data: target, isLoading } = useQuery(
    ['target', id],
    () => fetch(`/api/targets/${id}`).then(res => res.json())
  );

  const { data: stats, refetch: refetchStats } = useQuery(
    ['target-stats', id],
    () => fetch(`/api/targets/${id}/stats`).then(res => res.json())
  );

  const { data: vulnerabilities } = useQuery(
    ['vulnerabilities', id],
    () => fetch(`/api/vulnerabilities/target/${id}`).then(res => res.json())
  );

  const { data: reconResults, refetch: refetchRecon } = useQuery(
    ['recon-results', id],
    () => fetch(`/api/recon/results/${id}`).then(res => res.json())
  );

  const passiveScanMutation = useMutation(
    () => fetch(`/api/recon/passive/${id}`, { method: 'POST' }).then(res => res.json())
  );

  const activeScanMutation = useMutation(
    () => fetch(`/api/recon/active/${id}`, { method: 'POST' }).then(res => res.json())
  );

  const quickScanMutation = useMutation(
    () => fetch(`/api/recon/quick-scan/${id}`, { method: 'POST' }).then(res => res.json())
  );

  useEffect(() => {
    const newSocket = connectSocket();
    setSocket(newSocket);

    newSocket.emit('join-target', id);

    newSocket.on('script-output', (data) => {
      setScanOutput(prev => prev + data.output);
    });

    newSocket.on('script-error', (data) => {
      setScanOutput(prev => prev + `ERROR: ${data.error}`);
    });

    newSocket.on('job-status-update', (data) => {
      if (data.status === 'completed' || data.status === 'failed') {
        setCurrentScan(null);
        refetchStats();
        refetchRecon();
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [id, refetchStats, refetchRecon]);

  const handlePassiveScan = async () => {
    try {
      const result = await passiveScanMutation.mutateAsync();
      setCurrentScan(result.jobId);
      setScanOutput('');
    } catch (error) {
      console.error('Passive scan error:', error);
    }
  };

  const handleActiveScan = async () => {
    try {
      const result = await activeScanMutation.mutateAsync();
      setCurrentScan(result.jobId);
      setScanOutput('');
    } catch (error) {
      console.error('Active scan error:', error);
    }
  };

  const handleQuickScan = async () => {
    try {
      const result = await quickScanMutation.mutateAsync();
      setCurrentScan(result.jobId);
      setScanOutput('');
    } catch (error) {
      console.error('Quick scan error:', error);
    }
  };

  if (isLoading) return <LinearProgress />;

  return (
    <Container maxWidth="xl">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/targets')}
          sx={{ mr: 2, color: '#00ff41' }}
        >
          Back to Targets
        </Button>
        <Typography variant="h4" sx={{ color: '#00ff41' }}>
          {target?.name || target?.domain}
        </Typography>
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssessmentIcon sx={{ color: '#00ff41', mr: 1 }} />
                <Typography variant="h6">Statistics</Typography>
              </Box>
              <Typography variant="body2">Total Scans: {stats?.total_recon_jobs || 0}</Typography>
              <Typography variant="body2">Completed: {stats?.completed_jobs || 0}</Typography>
              <Typography variant="body2">Vulnerabilities: {stats?.total_vulnerabilities || 0}</Typography>
              <Typography variant="body2">Critical: {stats?.critical_vulns || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TimelineIcon sx={{ color: '#00ff41', mr: 1 }} />
                <Typography variant="h6">Quick Actions</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={currentScan ? <StopIcon /> : <PlayIcon />}
                    onClick={handlePassiveScan}
                    disabled={!!currentScan || passiveScanMutation.isLoading}
                    sx={{ 
                      backgroundColor: '#00ff41',
                      color: '#000',
                      '&:hover': { backgroundColor: '#00cc33' },
                      '&:disabled': { backgroundColor: '#666', color: '#999' }
                    }}
                  >
                    {passiveScanMutation.isLoading ? 'Starting...' : 'Passive Recon'}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={currentScan ? <StopIcon /> : <PlayIcon />}
                    onClick={handleActiveScan}
                    disabled={!!currentScan || activeScanMutation.isLoading}
                    sx={{ 
                      backgroundColor: '#ff9800',
                      color: '#000',
                      '&:hover': { backgroundColor: '#f57c00' },
                      '&:disabled': { backgroundColor: '#666', color: '#999' }
                    }}
                  >
                    {activeScanMutation.isLoading ? 'Starting...' : 'Active Recon'}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={currentScan ? <StopIcon /> : <PlayIcon />}
                    onClick={handleQuickScan}
                    disabled={!!currentScan || quickScanMutation.isLoading}
                    sx={{ 
                      backgroundColor: '#f44336',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#d32f2f' },
                      '&:disabled': { backgroundColor: '#666', color: '#999' }
                    }}
                  >
                    {quickScanMutation.isLoading ? 'Starting...' : 'Vuln Scan'}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => {
                      refetchStats();
                      refetchRecon();
                    }}
                    sx={{ 
                      borderColor: '#00ff41', 
                      color: '#00ff41',
                      '&:hover': { borderColor: '#00cc33', backgroundColor: '#00ff4133' }
                    }}
                  >
                    Refresh
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {currentScan && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Scan in progress... Job ID: {currentScan}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: '#333' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Reconnaissance Results" />
          <Tab label="Vulnerabilities" />
          <Tab label="Scan Output" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>
                  Subdomains Found ({reconResults?.subdomains?.length || 0})
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {reconResults?.subdomains?.map((subdomain, index) => (
                    <Typography key={index} variant="body2" sx={{ py: 0.5 }}>
                      {subdomain}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>
                  Live Hosts ({reconResults?.liveHosts?.length || 0})
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {reconResults?.liveHosts?.map((host, index) => (
                    <Box key={index} sx={{ py: 1 }}>
                      <Typography variant="body2" sx={{ color: '#00ff41' }}>
                        {host.url}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Status: {host.status} | Title: {host.title || 'N/A'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
          <CardContent>
            <Box display="flex" alignItems-center" mb={2}>
              <BugReportIcon sx={{ color: '#f44336', mr: 1 }} />
              <Typography variant="h6">Vulnerabilities Found</Typography>
            </Box>
            <TableContainer component={Paper} sx={{ bgcolor: '#0a0a0a' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#00ff41' }}>Title</TableCell>
                    <TableCell sx={{ color: '#00ff41' }}>Severity</TableCell>
                    <TableCell sx={{ color: '#00ff41' }}>CWE</TableCell>
                    <TableCell sx={{ color: '#00ff41' }}>Status</TableCell>
                    <TableCell sx={{ color: '#00ff41' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vulnerabilities?.map((vuln) => (
                    <TableRow key={vuln.id}>
                      <TableCell sx={{ color: '#fff' }}>{vuln.title}</TableCell>
                      <TableCell>
                        <Chip 
                          label={vuln.severity} 
                          size="small"
                          color={vuln.severity === 'Critical' ? 'error' : vuln.severity === 'High' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#fff' }}>{vuln.cwe_id || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={vuln.status} 
                          size="small"
                          color={vuln.status === 'open' ? 'error' : 'success'}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#fff' }}>
                        {new Date(vuln.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>
              Scan Output
            </Typography>
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
              {scanOutput || 'No scan output yet. Run a scan to see results.'}
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
    </Container>
  );
};

export default TargetDetail;