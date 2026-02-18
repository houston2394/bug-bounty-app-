import React, { useState } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  Accordion, AccordionSummary, AccordionDetails,
  Button, Chip, List, ListItem, ListItemText
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Lightbulb as LightbulbIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

const Learning = () => {
  const [expandedPanel, setExpandedPanel] = useState(false);

  const handlePanelChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const learningModules = [
    {
      id: 'basics',
      title: 'Bug Bounty Fundamentals',
      icon: <SchoolIcon />,
      content: {
        description: 'Essential concepts every bug bounty hunter should know',
        topics: [
          {
            title: 'Understanding Bug Bounty Programs',
            content: 'Bug bounty programs are crowdsourced security initiatives where organizations reward ethical hackers for finding and reporting security vulnerabilities.',
            keyPoints: [
              'VDP (Vulnerability Disclosure Programs) vs paid bug bounty programs',
              'Scope definition and rules of engagement',
              'Reward structures and payment models',
              'Legal frameworks and responsible disclosure'
            ]
          },
          {
            title: 'Types of Vulnerabilities',
            content: 'Common vulnerability categories you should focus on when hunting for bugs.',
            keyPoints: [
              'Injection vulnerabilities (SQL, NoSQL, Command)',
              'Cross-Site Scripting (XSS) and related attacks',
              'Authentication and authorization bypasses',
              'Business logic flaws and race conditions',
              'Server-Side Request Forgery (SSRF)',
              'Insecure Direct Object References (IDOR)'
            ]
          },
          {
            title: 'The Hacker Mindset',
            content: 'Develop the thinking patterns that make successful bug bounty hunters.',
            keyPoints: [
              'Think like an attacker, not a defender',
              'Question assumptions and break conventions',
              'Combine multiple vulnerabilities for impact',
              'Understand the business context of the application',
              'Practice systematic and methodical testing'
            ]
          }
        ]
      }
    },
    {
      id: 'reconnaissance',
      title: 'Reconnaissance Techniques',
      icon: <TimelineIcon />,
      content: {
        description: 'Master the art of information gathering for bug bounty',
        topics: [
          {
            title: 'Passive Reconnaissance',
            content: 'Gather intelligence without directly interacting with the target.',
            keyPoints: [
              'Subdomain enumeration using multiple tools',
              'Wayback Machine for historical data',
              'GitHub and code repositories for secrets',
              'Shodan, Censys for infrastructure mapping',
              'DNS enumeration and zone transfers',
              'SSL/TLS certificate analysis'
            ]
          },
          {
            title: 'Active Reconnaissance',
            content: 'Directly interact with targets to discover live services.',
            keyPoints: [
              'Port scanning strategies and techniques',
              'Service enumeration and version detection',
              'Directory and file fuzzing',
              'Parameter discovery',
              'API endpoint enumeration',
              'Technology stack identification'
            ]
          },
          {
            title: 'OSINT (Open-Source Intelligence)',
            content: 'Leverage publicly available information for bug hunting.',
            keyPoints: [
              'Social media reconnaissance',
              'Employee information gathering',
              'Company infrastructure analysis',
              'Third-party integrations',
              'Job postings and technology clues',
              'Conference talks and research papers'
            ]
          }
        ]
      }
    },
    {
      id: 'vulnerability',
      title: 'Vulnerability Assessment',
      icon: <SecurityIcon />,
      content: {
        description: 'Systematic approaches to finding security vulnerabilities',
        topics: [
          {
            title: 'Web Application Testing',
            content: 'Comprehensive testing methodology for web applications.',
            keyPoints: [
              'Input validation and sanitization testing',
              'Authentication bypass techniques',
              'Session management flaws',
              'CORS and CSP misconfigurations',
              'File upload vulnerabilities',
              'XXE and template injection'
            ]
          },
          {
            title: 'API Security Testing',
            content: 'Specialized techniques for testing REST and GraphQL APIs.',
            keyPoints: [
              'Broken Object Level Authorization (BOLA)',
              'Mass assignment vulnerabilities',
              'Excessive data exposure',
              'Rate limiting bypass',
              'Parameter pollution',
              'GraphQL-specific vulnerabilities'
            ]
          },
          {
            title: 'Mobile Application Testing',
            content: 'Mobile-specific vulnerability classes and testing approaches.',
            keyPoints: [
              'Insecure data storage',
              'Hardcoded secrets and credentials',
              'Insecure network communication',
              'Deep link exploitation',
              'Binary analysis and reverse engineering',
              'Platform-specific vulnerabilities'
            ]
          }
        ]
      }
    },
    {
      id: 'tools',
      title: 'Tool Mastery',
      icon: <SpeedIcon />,
      content: {
        description: 'Master the essential tools for efficient bug bounty hunting',
        topics: [
          {
            title: 'Reconnaissance Tools',
            content: 'Comprehensive toolkit for information gathering.',
            keyPoints: [
              'Subfinder, Amass for subdomain enumeration',
              'Nmap for port scanning and service detection',
              'Feroxbuster, Gobuster for content discovery',
              'Waybackurls for historical URL collection',
              'WhatWeb, Wappalyzer for tech detection',
              'Custom scripts and automation'
            ]
          },
          {
            title: 'Vulnerability Scanning',
            content: 'Automated tools to complement manual testing.',
            keyPoints: [
              'Nuclei for template-based scanning',
              'Burp Suite for web application testing',
              'OWASP ZAP for automated scanning',
              'SQLMap for SQL injection detection',
              'Custom payload generation',
              'Integration and workflow automation'
            ]
          },
          {
            title: 'Exploitation and Documentation',
            content: 'Tools for proof of concept development and reporting.',
            keyPoints: [
              'Burp Suite Intruder and Repeater',
              'cURL for manual request crafting',
              'Screen capture and recording tools',
              'Report generation and documentation',
              'Collaboration and knowledge sharing',
              'Building your own toolchain'
            ]
          }
        ]
      }
    },
    {
      id: 'advanced',
      title: 'Advanced Techniques',
      icon: <LightbulbIcon />,
      content: {
        description: 'Take your bug bounty skills to the next level',
        topics: [
          {
            title: 'Business Logic Exploitation',
            content: 'Beyond technical vulnerabilities - exploiting business logic.',
            keyPoints: [
              'Race conditions in multi-step processes',
              'Price manipulation and bypasses',
              'Workflow abuse and privilege escalation',
              'Resource exhaustion and DoS',
              'Time-based attacks and timing leaks',
              'State manipulation and bypasses'
            ]
          },
          {
            title: 'Cloud Security',
            content: 'Hunting for vulnerabilities in cloud environments.',
            keyPoints: [
              'S3 bucket exposure and misconfigurations',
              'IAM privilege escalation',
              'Serverless function vulnerabilities',
              'Container escape techniques',
              'Metadata service abuse',
              'Cloud-specific attack patterns'
            ]
          },
          {
            title: 'Automation and Scale',
            content: 'Building systems to hunt at scale efficiently.',
            keyPoints: [
              'Custom reconnaissance pipelines',
              'Automated vulnerability detection',
              'Mass target analysis',
              'Tool integration and orchestration',
              'Machine learning for bug hunting',
              'Building your own frameworks'
            ]
          }
        ]
      }
    }
  ];

  const quickTips = [
    {
      category: 'Reconnaissance',
      tips: [
        'Always start with passive reconnaissance to avoid detection',
        'Use multiple subdomain enumeration tools for better coverage',
        'Save and correlate data from different sources',
        'Focus on interesting subdomains (admin, dev, test, staging)',
        'Check for forgotten infrastructure and old applications'
      ]
    },
    {
      category: 'Vulnerability Hunting',
      tips: [
        'Test authentication bypasses on every login form',
        'Look for IDORs in API endpoints',
        'Test file upload functionality carefully',
        'Check for reflected XSS in parameters',
        'Examine JavaScript files for sensitive information',
        'Always test privilege escalation scenarios'
      ]
    },
    {
      category: 'Reporting',
      tips: [
        'Write clear, concise vulnerability descriptions',
        'Include detailed reproduction steps',
        'Provide business impact analysis',
          'Suggest specific remediation steps',
        'Include proof of concept with screenshots',
        'Follow the program\'s reporting format guidelines'
      ]
    },
    {
      category: 'Career Development',
      tips: [
        'Build a public profile on platforms like HackerOne',
        'Write blog posts about your findings',
        'Contribute to open-source security tools',
        'Participate in security competitions',
        'Network with other security researchers',
        'Stay updated with latest vulnerability research'
      ]
    }
  ];

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ color: '#00ff41', mb: 4 }}>
        🎓 Learning Hub
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {learningModules.map((module) => (
            <Accordion
              key={module.id}
              expanded={expandedPanel === module.id}
              onChange={handlePanelChange(module.id)}
              sx={{
                bgcolor: '#1a1a1a',
                border: '1px solid #333',
                mb: 2,
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  border: '1px solid #00ff41',
                  margin: '8px 0'
                }
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ color: '#00ff41' }} />}
                sx={{ 
                  '& .MuiAccordionSummary-content': {
                    color: '#00ff41',
                    fontWeight: 'bold'
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  {module.icon}
                  <Typography variant="h6">
                    {module.title}
                  </Typography>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails sx={{ bgcolor: '#0a0a0a' }}>
                <Typography paragraph sx={{ color: '#fff' }}>
                  {module.content.description}
                </Typography>
                
                {module.content.topics.map((topic, index) => (
                  <Card key={index} sx={{ 
                    bgcolor: '#1a1a1a', 
                    border: '1px solid #333', 
                    mb: 2 
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#00ff41', mb: 1 }}>
                        {topic.title}
                      </Typography>
                      <Typography paragraph sx={{ color: '#fff' }}>
                        {topic.content}
                      </Typography>
                      <List>
                        {topic.keyPoints.map((point, pointIndex) => (
                          <ListItem key={pointIndex} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={`• ${point}`}
                              primaryTypographyProps={{
                                sx: { color: '#ccc', fontSize: '0.9rem' }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            bgcolor: '#1a1a1a', 
            border: '1px solid #333',
            position: 'sticky',
            top: 20
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#00ff41' }}>
                💡 Quick Tips
              </Typography>
              
              {quickTips.map((category, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: '#ff9800', mb: 1 }}>
                    {category.category}
                  </Typography>
                  <List dense>
                    {category.tips.map((tip, tipIndex) => (
                      <ListItem key={tipIndex} sx={{ py: 0.3 }}>
                        <ListItemText
                          primary={tip}
                          primaryTypographyProps={{
                            sx: { 
                              color: '#ccc', 
                              fontSize: '0.8rem',
                              lineHeight: 1.3
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}

              <Box sx={{ mt: 3, p: 2, bgcolor: '#00ff4111', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ color: '#00ff41', mb: 1 }}>
                  🎯 Pro Tip
                </Typography>
                <Typography variant="body2" sx={{ color: '#ccc', fontSize: '0.8rem' }}>
                  The best bug bounty hunters combine technical skills with business understanding. 
                  Always consider the real-world impact of the vulnerabilities you find.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Learning;