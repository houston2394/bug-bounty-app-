import React from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress, Chip } from '@mui/material';
import { useQuery } from 'react-query';
import { 
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Target as TargetIcon,
  BugReport as BugReportIcon 
} from '@mui/icons-material';
import { targetsApi } from '../services/api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <Card sx={{ 
    bgcolor: '#1a1a1a', 
    border: '1px solid #333',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      borderColor: '#00ff41'
    }
  }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="text.secondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ color, fontWeight: 'bold' }}>
            {value}
          </Typography>
          {trend && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUpIcon sx={{ color: '#00ff41', mr: 0.5, fontSize: 16 }} />
              <Typography variant="body2" color="#00ff41">
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
        <Icon sx={{ fontSize: 40, color }} />
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { data: targets, isLoading: targetsLoading } = useQuery('targets', targetsApi.getAll);
  const { data: stats, isLoading: statsLoading } = useQuery('dashboard-stats', async () => {
    // This would be a real API call to get dashboard stats
    return {
      totalTargets: 12,
      activeTargets: 8,
      totalVulnerabilities: 47,
      criticalVulnerabilities: 3,
      recentScans: 15,
      successRate: 87
    };
  });

  const recentActivity = [
    { id: 1, target: 'example.com', action: 'Passive Recon', status: 'completed', time: '2 hours ago' },
    { id: 2, target: 'test.org', action: 'Vulnerability Scan', status: 'running', time: '5 hours ago' },
    { id: 3, target: 'demo.net', action: 'Report Generated', status: 'completed', time: '1 day ago' },
  ];

  if (targetsLoading || statsLoading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#00ff41', mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Targets"
            value={stats?.totalTargets || 0}
            icon={TargetIcon}
            color="#00ff41"
            trend="+2 this week"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Scans"
            value={stats?.activeTargets || 0}
            icon={SecurityIcon}
            color="#ff9800"
            trend="3 running now"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vulnerabilities Found"
            value={stats?.totalVulnerabilities || 0}
            icon={BugReportIcon}
            color="#f44336"
            trend="+5 this week"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Success Rate"
            value={`${stats?.successRate || 0}%`}
            icon={TrendingUpIcon}
            color="#2196f3"
            trend="+3% improvement"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>
                Recent Activity
              </Typography>
              {recentActivity.map((activity) => (
                <Box
                  key={activity.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: '1px solid #333'
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ color: '#ffffff' }}>
                      {activity.action} - {activity.target}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                  <Chip
                    label={activity.status}
                    color={activity.status === 'completed' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a1a1a', border: '1px solid #333' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  • Add new target to start hunting
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Run passive reconnaissance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Check vulnerability scan results
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Generate professional reports
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;