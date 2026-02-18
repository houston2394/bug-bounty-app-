import React, { useState } from 'react';
import { 
  Container, Typography, Box, Button, Dialog, DialogTitle, 
  DialogContent, TextField, Grid, Card, CardContent, 
  CardActions, Chip, IconButton, Menu, MenuItem 
} from '@mui/material';
import { 
  Add as AddIcon, 
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { targetsApi } from '../services/api';

const Targets = () => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [formData, setFormData] = useState({
    domain: '',
    name: '',
    description: '',
    scope: []
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: targets, isLoading } = useQuery('targets', targetsApi.getAll);

  const createMutation = useMutation(targetsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('targets');
      setOpen(false);
      setFormData({ domain: '', name: '', description: '', scope: [] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleMenuClick = (event, target) => {
    setAnchorEl(event.currentTarget);
    setSelectedTarget(target);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTarget(null);
  };

  const getSeverityColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'monitoring': return 'warning';
      default: return 'default';
    }
  };

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="xl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ color: '#00ff41' }}>
          Targets
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
          Add Target
        </Button>
      </Box>

      <Grid container spacing={3}>
        {targets?.map((target) => (
          <Grid item xs={12} sm={6} md={4} key={target.id}>
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
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>
                      {target.name || target.domain}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {target.domain}
                    </Typography>
                    {target.description && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {target.description}
                      </Typography>
                    )}
                  </Box>
                  <IconButton onClick={(e) => handleMenuClick(e, target)} sx={{ color: '#fff' }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                
                <Box display="flex" gap={1} mb={2}>
                  <Chip 
                    label={target.status} 
                    size="small" 
                    color={getSeverityColor(target.status)}
                  />
                  <Chip 
                    label={`${JSON.parse(target.scope || '[]').length} scope items`} 
                    size="small" 
                    variant="outlined"
                    sx={{ borderColor: '#333', color: '#fff' }}
                  />
                </Box>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate(`/targets/${target.id}`)}
                  sx={{ color: '#00ff41' }}
                >
                  View
                </Button>
                <Button 
                  size="small" 
                  startIcon={<PlayIcon />}
                  onClick={() => navigate(`/recon?target=${target.id}`)}
                  sx={{ color: '#ff9800' }}
                >
                  Run Recon
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/targets/${selectedTarget?.id}`);
          handleMenuClose();
        }}>
          <VisibilityIcon sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/recon?target=${selectedTarget?.id}`);
          handleMenuClose();
        }}>
          <PlayIcon sx={{ mr: 1 }} /> Run Reconnaissance
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: Implement edit functionality
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
      </Menu>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: '#00ff41' }}>Add New Target</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Domain"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
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
            <TextField
              fullWidth
              label="Name (Optional)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
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
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#00ff41' },
                  '&.Mui-focused fieldset': { borderColor: '#00ff41' }
                }
              }}
            />
            <Box display="flex" gap={2} mt={3}>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isLoading}
                sx={{ 
                  backgroundColor: '#00ff41',
                  color: '#000',
                  '&:hover': { backgroundColor: '#00cc33' }
                }}
              >
                {createMutation.isLoading ? 'Creating...' : 'Create Target'}
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

export default Targets;