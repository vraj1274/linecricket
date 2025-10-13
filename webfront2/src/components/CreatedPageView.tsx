import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Briefcase, Settings, Users, Info, FileText, BarChart3, Edit3, Trash2, Eye, Share, Save, X, MapPin, Calendar, Heart, MessageCircle, Phone, Mail, Globe, Building2, Star, Image, Video, Hash } from 'lucide-react';
import { useUserProfile } from '../contexts/UserProfileContext';
import { apiService } from '../services/api';

interface CreatedPageViewProps {
  onBack: () => void;
  pageId?: string;
  pageName?: string;
  pageType?: 'academy' | 'venue' | 'community' | 'club' | 'pitch';
}

export function CreatedPageView({ onBack, pageId, pageName, pageType }: CreatedPageViewProps) {
  const { userProfile } = useUserProfile();
  const [activeSection, setActiveSection] = useState<'overview' | 'create-post' | 'create-job' | 'create-job-form' | 'manage-posts' | 'add-member' | 'add-member-form' | 'about' | 'edit-page'>('overview');
  
  // Debug logging
  console.log('CreatedPageView props:', { pageId, pageName, pageType });

  const handleCreateJob = () => {
    setActiveSection('create-job-form');
  };

  const handleAddMember = () => {
    setActiveSection('add-member-form');
  };

  const handleManagePosts = () => {
    setActiveSection('manage-posts');
  };

  const handleAbout = () => {
    setActiveSection('about');
  };

  const handleEditPage = () => {
    // Initialize edit form with current page data based on page type
    const baseData = {
      name: pageInfo.name,
      description: pageInfo.description,
      location: pageInfo.location,
      contact: pageInfo.contact,
      website: pageInfo.website,
      gallery_images: pageInfo.gallery_images
    };

    let typeSpecificData = {};
    
    if (pageType === 'academy') {
      typeSpecificData = {
        academy_name: pageInfo.academy_name,
        academy_type: pageInfo.academy_type,
        level: pageInfo.level,
        established_year: pageInfo.established_year,
        accreditation: pageInfo.accreditation,
        coaching_staff_count: pageInfo.coaching_staff_count,
        total_students: pageInfo.total_students,
        successful_placements: pageInfo.successful_placements,
        equipment_provided: pageInfo.equipment_provided,
        programs_offered: pageInfo.programs_offered,
        age_groups: pageInfo.age_groups,
        batch_timings: pageInfo.batch_timings,
        fees_structure: pageInfo.fees_structure,
        facilities: pageInfo.facilities,
        services_offered: pageInfo.services_offered,
        achievements: pageInfo.achievements,
        testimonials: pageInfo.testimonials
      };
    } else if (pageType === 'venue' || pageType === 'pitch') {
      typeSpecificData = {
        venue_name: pageInfo.venue_name,
        venue_type: pageInfo.venue_type,
        ground_type: pageInfo.ground_type,
        capacity: pageInfo.capacity,
        ground_length: pageInfo.ground_length,
        ground_width: pageInfo.ground_width,
        pitch_count: pageInfo.pitch_count,
        net_count: pageInfo.net_count,
        floodlights: pageInfo.floodlights,
        covered_area: pageInfo.covered_area,
        parking_available: pageInfo.parking_available,
        changing_rooms: pageInfo.changing_rooms,
        equipment_rental: pageInfo.equipment_rental,
        booking_rates: pageInfo.booking_rates,
        amenities: pageInfo.amenities,
        operating_hours: pageInfo.operating_hours,
        booking_advance_days: pageInfo.booking_advance_days,
        minimum_booking_hours: pageInfo.minimum_booking_hours,
        maximum_booking_hours: pageInfo.maximum_booking_hours
      };
    } else if (pageType === 'community') {
      typeSpecificData = {
        community_name: pageInfo.community_name,
        community_type: pageInfo.community_type,
        member_count: pageInfo.member_count,
        community_rules: pageInfo.community_rules,
        meeting_schedule: pageInfo.meeting_schedule,
        membership_fee: pageInfo.membership_fee,
        membership_duration: pageInfo.membership_duration,
        community_events_count: pageInfo.community_events_count,
        active_members: pageInfo.active_members,
        community_guidelines: pageInfo.community_guidelines
      };
    }

    setEditPageData({ ...baseData, ...typeSpecificData });
    setActiveSection('edit-page');
  };

  const handleSavePageEdit = async () => {
    if (!pageId) return;
    
    try {
      setLoading(true);
      const actualPageId = pageId?.startsWith('page_') ? pageId.substring(5) : pageId;
      
      const response = await fetch(`http://localhost:5000/api/profiles/${actualPageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editPageData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Page updated successfully');
        // Update local page info
        setPageInfo(prev => ({
          ...prev,
          ...editPageData,
          name: editPageData.academy_name || prev.name
        }));
        setActiveSection('overview');
        alert('Page updated successfully!');
      } else {
        console.error('❌ Failed to update page:', data.error);
        setError(data.error || 'Failed to update page');
      }
    } catch (error) {
      console.error('❌ Error updating page:', error);
      setError('Failed to update page');
    } finally {
      setLoading(false);
    }
  };

  // Form submission handlers
  // Enhanced post creation functions (from CreatePost.tsx)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Limit to 10 images total
      const maxImages = 10;
      const currentCount = images.length;
      const availableSlots = maxImages - currentCount;
      
      if (availableSlots <= 0) {
        alert('You can only upload up to 10 images');
        return;
      }
      
      const filesToAdd = Array.from(files).slice(0, availableSlots);
      const newImages = filesToAdd.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
      setMediaType('images');
      setVideo(''); // Clear video if images are selected
      
      if (files.length > availableSlots) {
        alert(`Only ${availableSlots} more images can be added (max 10 total)`);
      }
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideo(URL.createObjectURL(file));
      setMediaType('video');
      setImages([]); // Clear images if video is selected
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo('');
    setMediaType(null);
  };

  const extractHashtags = (content: string) => {
    return content.match(/#\w+/g) || [];
  };

  const extractMentions = (content: string) => {
    return content.match(/@\w+/g) || [];
  };

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && images.length === 0 && !video) return;
    
    try {
      setIsCreating(true);
      
      // Debug authentication and page data
      console.log('🔍 Debugging authentication...');
      const authToken = localStorage.getItem('authToken');
      const firebaseToken = localStorage.getItem('firebaseToken');
      console.log('Auth tokens:', { authToken: !!authToken, firebaseToken: !!firebaseToken });
      console.log('Page data:', { pageId, pageType, pageName });
      
      const postData = {
        content: caption.trim(),
        image_url: images.length > 0 ? images : undefined, // Send all images as array
        image_caption: images.length > 0 ? caption.trim() : undefined, // Use caption as image caption
        video_url: video || undefined, // Rename video to video_url for clarity
        location: location || undefined,
        post_type: video ? 'video' : (images.length > 0 ? 'image' : 'text'),
        visibility: visibility,
        page_id: pageId, // Include the page ID for page-specific posts
        page_type: pageType // Include the page type for proper categorization
      };
      
      console.log('📤 Sending post data:', postData);
      console.log('📤 Page context:', { pageId, pageType, pageName });
      const result = await apiService.createSocialPost(postData);
      console.log('✅ Post created successfully:', result);
      
      if (result.post || result.message) {
        // Add the new post to local state
        const newPost = {
          id: result.post.id,
          title: caption.substring(0, 50) + (caption.length > 50 ? '...' : ''),
          content: caption,
          type: 'post',
          status: 'published',
          created_at: new Date().toISOString().split('T')[0],
          author: pageInfo.name || pageName || 'Unknown Page',
          likes: 0,
          comments: 0,
          shares: 0
        };
        
        setPosts(prev => [newPost, ...prev]);
        
        // Reset form
        setCaption('');
        setImages([]);
        setVideo('');
        setLocation('');
        setVisibility('public');
        setMediaType(null);
        setActiveSection('overview');
        
        console.log('✅ Post added to local state');
        alert('Post created successfully! 🏏');
      } else {
        console.error('❌ Failed to create post:', result);
        console.error('❌ Result structure:', JSON.stringify(result, null, 2));
        alert(`Failed to create post: ${result.error || result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form submission started:', { jobTitle, jobDescription, jobLocation, jobType, jobSalary, jobExperience, pageId });
    console.log('User profile:', userProfile);
    console.log('User profile ID:', userProfile?.id);
    console.log('User profile email:', userProfile?.email);
    
    if (!jobTitle.trim() || !jobDescription.trim() || !pageId) {
      console.log('❌ Form validation failed:', { 
        jobTitle: jobTitle.trim(), 
        jobDescription: jobDescription.trim(), 
        pageId,
        hasJobTitle: !!jobTitle.trim(),
        hasJobDescription: !!jobDescription.trim(),
        hasPageId: !!pageId
      });
      setError('Please fill in all required fields');
      return;
    }
    
    console.log('✅ Form validation passed, proceeding with API call...');
    
    try {
      setLoading(true);
      setError(null);
      
      const actualPageId = pageId?.startsWith('page_') ? pageId.substring(5) : pageId;
      const requestBody = {
        page_id: actualPageId,
        user_id: userProfile?.id || '17c9109e-cb20-4723-be49-c26b8343cd19', // Fallback user_id
        title: jobTitle,
        description: jobDescription,
        location: jobLocation,
        job_type: jobType,
        salary_range: jobSalary,
        experience_required: jobExperience,
        contact_email: userProfile?.email || 'test@example.com', // Fallback email
      };
      
      console.log('🚀 Making API call with data:', requestBody);
      console.log('🚀 Final user_id being sent:', requestBody.user_id);
      console.log('🚀 Final contact_email being sent:', requestBody.contact_email);
      
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('📡 API Response status:', response.status);
      const data = await response.json();
      console.log('📡 API Response data:', data);
      
      if (data.success) {
        console.log('✅ Job created successfully, refreshing jobs list...');
        setJobTitle('');
        setJobDescription('');
        setJobLocation('');
        setJobSalary('');
        setJobExperience('0-1');
        setActiveSection('create-job'); // Changed from 'overview' to 'create-job' to show jobs
        // Refresh jobs list
        fetchJobs();
      } else {
        console.log('❌ Job creation failed:', data.error);
        setError(data.error || 'Failed to create job');
      }
    } catch (err) {
      setError('Failed to create job');
      console.error('Error creating job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== MEMBER SUBMISSION DEBUG ===');
    console.log('Form submission started:', { memberEmail, memberRole, pageId });
    console.log('User profile:', userProfile);
    
    if (!memberEmail.trim() || !pageId) {
      console.log('❌ Form validation failed:', { 
        memberEmail: memberEmail.trim(), 
        pageId,
        hasMemberEmail: !!memberEmail.trim(),
        hasPageId: !!pageId
      });
      setError('Please fill in all required fields');
      return;
    }
    
    console.log('✅ Form validation passed, proceeding with API call...');
    
    try {
      setLoading(true);
      setError(null);
      
      const actualPageId = pageId?.startsWith('page_') ? pageId.substring(5) : pageId;
      const requestBody = {
        page_id: actualPageId,
        name: memberEmail.split('@')[0], // Use email prefix as name
        email: memberEmail,
        role: memberRole,
        status: 'pending', // New members start as pending
        user_id: userProfile?.id || '17c9109e-cb20-4723-be49-c26b8343cd19', // Fallback user_id
      };
      
      console.log('🚀 Making API call with data:', requestBody);
      
      const response = await fetch('http://localhost:5000/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('📡 API Response status:', response.status);
      const data = await response.json();
      console.log('📡 API Response data:', data);
      
      if (data.success) {
        console.log('✅ Member added successfully, refreshing members list...');
        setMemberEmail('');
        setMemberMessage('');
        setActiveSection('add-member'); // Stay on members tab to show the new member
        // Refresh members list
        fetchMembers();
      } else {
        console.log('❌ Member addition failed:', data.error);
        setError(data.error || 'Failed to add member');
      }
    } catch (err) {
      setError('Failed to add member');
      console.error('Error adding member:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real data from API
  const [posts, setPosts] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Post editing state
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Edit job state
  const [editingJob, setEditingJob] = useState<any>(null);
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editJobDescription, setEditJobDescription] = useState('');
  const [editJobLocation, setEditJobLocation] = useState('');
  const [editJobType, setEditJobType] = useState('full-time');
  const [editJobSalary, setEditJobSalary] = useState('');
  const [editJobExperience, setEditJobExperience] = useState('0-1');
  
  // Edit member state
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberEmail, setEditMemberEmail] = useState('');
  const [editMemberRole, setEditMemberRole] = useState('member');
  const [editMemberStatus, setEditMemberStatus] = useState('pending');

  // Edit page state - dynamic based on page type
  const [editPageData, setEditPageData] = useState({
    // Common fields
    name: '',
    description: '',
    location: '',
    contact: '',
    website: '',
    
    // Academy-specific fields
    academy_name: '',
    academy_type: '',
    level: '',
    established_year: null,
    accreditation: '',
    coaching_staff_count: 0,
    total_students: 0,
    successful_placements: 0,
    equipment_provided: false,
    programs_offered: [],
    age_groups: '',
    batch_timings: [],
    fees_structure: {},
    facilities: [],
    services_offered: [],
    achievements: [],
    testimonials: [],
    
    // Venue-specific fields
    venue_name: '',
    venue_type: '',
    ground_type: '',
    capacity: 0,
    ground_length: 0,
    ground_width: 0,
    pitch_count: 0,
    net_count: 0,
    floodlights: false,
    covered_area: false,
    parking_available: false,
    changing_rooms: false,
    equipment_rental: false,
    booking_rates: {},
    amenities: [],
    operating_hours: {},
    booking_advance_days: 7,
    minimum_booking_hours: 1.0,
    maximum_booking_hours: 8.0,
    
    // Community-specific fields
    community_name: '',
    community_type: '',
    member_count: 0,
    community_rules: '',
    meeting_schedule: {},
    membership_fee: 0,
    membership_duration: '',
    community_events_count: 0,
    active_members: 0,
    community_guidelines: '',
    
    // Common fields
    gallery_images: []
  });

  // API functions
  const fetchJobs = async () => {
    if (!pageId) {
      console.log('❌ fetchJobs: No pageId provided');
      return;
    }
    try {
      setLoading(true);
      // Remove 'page_' prefix if present to get the actual UUID
      const actualPageId = pageId?.startsWith('page_') ? pageId.substring(5) : pageId;
      console.log('🔄 fetchJobs: Fetching jobs for page_id:', actualPageId);
      const response = await fetch(`http://localhost:5000/api/jobs?page_id=${actualPageId}`);
      const data = await response.json();
      console.log('📡 fetchJobs: API response:', data);
      if (data.success) {
        setJobs(data.jobs);
        console.log('✅ fetchJobs: Jobs set in state:', data.jobs);
      } else {
        console.error('❌ fetchJobs: API error:', data.error);
        setError(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Failed to fetch jobs');
      console.error('❌ fetchJobs: Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!pageId) return;
    try {
      setLoading(true);
      // Remove 'page_' prefix if present to get the actual UUID
      const actualPageId = pageId?.startsWith('page_') ? pageId.substring(5) : pageId;
      const response = await fetch(`http://localhost:5000/api/members?page_id=${actualPageId}`);
      const data = await response.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (err) {
      setError('Failed to fetch members');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    if (!pageId) return;
    try {
      setLoading(true);
      // Remove 'page_' prefix if present to get the actual UUID
      const actualPageId = pageId?.startsWith('page_') ? pageId.substring(5) : pageId;
      const response = await fetch(`http://localhost:5000/api/posts?page_id=${actualPageId}`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (pageId) {
      console.log('🔄 Component mounted, fetching data for pageId:', pageId);
      fetchPageData(); // Fetch page data first
      fetchJobs();
      fetchMembers();
      fetchPosts();
    }
  }, [pageId]);

  // Force refresh jobs when activeSection changes to create-job
  useEffect(() => {
    if (activeSection === 'create-job' && pageId) {
      console.log('🔄 Active section is create-job, refreshing jobs...');
      fetchJobs();
    }
  }, [activeSection, pageId]);

  // Debug active section changes
  useEffect(() => {
    console.log('🎯 Active section changed to:', activeSection);
  }, [activeSection]);

  // Fetch category details when about section is active
  useEffect(() => {
    if (activeSection === 'about') {
      console.log('🔄 About section active, fetching category details...');
      fetchCategoryDetails();
    }
  }, [activeSection, pageId, pageType]);

  // Edit job functions
  const handleEditJob = (job: any) => {
    console.log('✏️ Editing job:', job);
    setEditingJob(job);
    setEditJobTitle(job.title);
    setEditJobDescription(job.description);
    setEditJobLocation(job.location);
    setEditJobType(job.job_type);
    setEditJobSalary(job.salary_range);
    setEditJobExperience(job.experience_required);
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob || !editJobTitle.trim() || !editJobDescription.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const actualPageId = pageId?.startsWith('page_') ? pageId.substring(5) : pageId;
      const requestBody = {
        page_id: actualPageId,
        user_id: userProfile?.id || '17c9109e-cb20-4723-be49-c26b8343cd19',
        title: editJobTitle,
        description: editJobDescription,
        location: editJobLocation,
        job_type: editJobType,
        salary_range: editJobSalary,
        experience_required: editJobExperience,
        contact_email: userProfile?.email || 'test@example.com',
      };
      
      console.log('🔄 Updating job with data:', requestBody);
      
      const response = await fetch(`http://localhost:5000/api/jobs/${editingJob.job_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      console.log('📡 Update response:', data);
      
      if (data.success) {
        console.log('✅ Job updated successfully');
        setEditingJob(null);
        setEditJobTitle('');
        setEditJobDescription('');
        setEditJobLocation('');
        setEditJobSalary('');
        setEditJobExperience('0-1');
        fetchJobs(); // Refresh jobs list
      } else {
        console.log('❌ Job update failed:', data.error);
        setError(data.error || 'Failed to update job');
      }
    } catch (err) {
      setError('Failed to update job');
      console.error('Error updating job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ Deleting job:', jobId);
      
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      console.log('📡 Delete response:', data);
      
      if (data.success) {
        console.log('✅ Job deleted successfully');
        fetchJobs(); // Refresh jobs list
      } else {
        console.log('❌ Job deletion failed:', data.error);
        setError(data.error || 'Failed to delete job');
      }
    } catch (err) {
      setError('Failed to delete job');
      console.error('Error deleting job:', err);
    } finally {
      setLoading(false);
    }
  };

  // Edit member functions
  const handleEditMember = (member: any) => {
    console.log('✏️ Editing member:', member);
    setEditingMember(member);
    setEditMemberName(member.name);
    setEditMemberEmail(member.email);
    setEditMemberRole(member.role);
    setEditMemberStatus(member.status);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editMemberName.trim() || !editMemberEmail.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const actualPageId = pageId?.startsWith('page_') ? pageId.substring(5) : pageId;
      const requestBody = {
        page_id: actualPageId,
        name: editMemberName,
        email: editMemberEmail,
        role: editMemberRole,
        status: editMemberStatus,
        user_id: userProfile?.id || '17c9109e-cb20-4723-be49-c26b8343cd19',
      };
      
      console.log('🔄 Updating member with data:', requestBody);
      
      const response = await fetch(`http://localhost:5000/api/members/${editingMember.member_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      console.log('📡 Update response:', data);
      
      if (data.success) {
        console.log('✅ Member updated successfully');
        setEditingMember(null);
        setEditMemberName('');
        setEditMemberEmail('');
        setEditMemberRole('member');
        setEditMemberStatus('pending');
        fetchMembers(); // Refresh members list
      } else {
        console.log('❌ Member update failed:', data.error);
        setError(data.error || 'Failed to update member');
      }
    } catch (err) {
      setError('Failed to update member');
      console.error('Error updating member:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ Deleting member:', memberId);
      
      const response = await fetch(`http://localhost:5000/api/members/${memberId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      console.log('📡 Delete response:', data);
      
      if (data.success) {
        console.log('✅ Member deleted successfully');
        fetchMembers(); // Refresh members list
      } else {
        console.log('❌ Member deletion failed:', data.error);
        setError(data.error || 'Failed to delete member');
      }
    } catch (err) {
      setError('Failed to delete member');
      console.error('Error deleting member:', err);
    } finally {
      setLoading(false);
    }
  };

  // Post editing and deletion functions
  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setEditPostContent(post.content);
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editPostContent.trim()) {
      setError('Please enter post content');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Updating post:', editingPost.id);
      
      const response = await fetch(`http://localhost:5000/api/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editPostContent,
          post_type: 'general',
          visibility: 'public'
        })
      });
      
      const data = await response.json();
      console.log('📡 Update response:', data);
      
      if (response.ok) {
        console.log('✅ Post updated successfully');
        // Update the post in local state
        setPosts(prev => prev.map(post => 
          post.id === editingPost.id 
            ? { ...post, content: editPostContent }
            : post
        ));
        setEditingPost(null);
        setEditPostContent('');
      } else {
        console.log('❌ Post update failed:', data.error);
        setError(data.error || 'Failed to update post');
      }
    } catch (err) {
      setError('Failed to update post');
      console.error('Error updating post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ Deleting post:', postId);
      
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      console.log('📡 Delete response:', data);
      
      if (data.success || response.ok) {
        console.log('✅ Post deleted successfully');
        // Remove the post from local state
        setPosts(prev => prev.filter(post => post.id !== postId));
      } else {
        console.log('❌ Post deletion failed:', data.error);
        setError(data.error || 'Failed to delete post');
      }
    } catch (err) {
      setError('Failed to delete post');
      console.error('Error deleting post:', err);
    } finally {
      setLoading(false);
    }
  };

  // Form state for creating posts (enhanced from CreatePost.tsx)
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [postType, setPostType] = useState('text');
  const [postVisibility, setPostVisibility] = useState('public');
  
  // Enhanced post creation state (from CreatePost.tsx)
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isCreating, setIsCreating] = useState(false);
  const [mediaType, setMediaType] = useState<'images' | 'video' | null>(null);

  // Form state for creating jobs
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [jobSalary, setJobSalary] = useState('');
  const [jobExperience, setJobExperience] = useState('0-1');

  // Form state for adding members
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [memberMessage, setMemberMessage] = useState('');

  // Page information state - dynamic based on page type
  const [pageInfo, setPageInfo] = useState({
    name: pageName || 'My Page',
    description: 'This is a sample page created for testing purposes.',
    location: 'Mumbai, India',
    contact: 'contact@example.com',
    website: 'https://example.com',
    
    // Academy-specific fields
    academy_name: '',
    academy_type: '',
    level: '',
    established_year: null,
    accreditation: '',
    coaching_staff_count: 0,
    total_students: 0,
    successful_placements: 0,
    equipment_provided: false,
    programs_offered: [],
    age_groups: '',
    batch_timings: [],
    fees_structure: {},
    facilities: [],
    services_offered: [],
    achievements: [],
    testimonials: [],
    
    // Venue-specific fields
    venue_name: '',
    venue_type: '',
    ground_type: '',
    capacity: 0,
    ground_length: 0,
    ground_width: 0,
    pitch_count: 0,
    net_count: 0,
    floodlights: false,
    covered_area: false,
    parking_available: false,
    changing_rooms: false,
    equipment_rental: false,
    booking_rates: {},
    amenities: [],
    operating_hours: {},
    booking_advance_days: 7,
    minimum_booking_hours: 1.0,
    maximum_booking_hours: 8.0,
    
    // Community-specific fields
    community_name: '',
    community_type: '',
    member_count: 0,
    community_rules: '',
    meeting_schedule: {},
    membership_fee: 0,
    membership_duration: '',
    community_events_count: 0,
    active_members: 0,
    community_guidelines: '',
    
    // Common fields
    gallery_images: []
  });

  // Category-specific details state
  const [categoryDetails, setCategoryDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch page data from backend API
  const fetchPageData = async () => {
    if (!pageId) return;
    
    try {
      setLoadingDetails(true);
      const actualPageId = pageId?.startsWith('page_') ? pageId.substring(5) : pageId;
      console.log('🔄 Fetching page data for ID:', actualPageId);
      
      const response = await fetch(`http://localhost:5000/api/profiles/${actualPageId}`);
      const data = await response.json();
      
      if (data.success && data.profile) {
        console.log('✅ Page data fetched successfully:', data.profile);
        const profile = data.profile;
        
        // Update page info with actual data from backend
        setPageInfo({
          name: profile.academy_name || profile.name || pageName || 'My Page',
          description: profile.description || profile.bio || 'This is a sample page created for testing purposes.',
          location: profile.location || profile.city + ', ' + profile.state || 'Mumbai, India',
          contact: profile.contact_number || profile.email || 'contact@example.com',
          website: profile.website || 'https://example.com',
          academy_name: profile.academy_name || '',
          academy_type: profile.academy_type || '',
          level: profile.level || '',
          established_year: profile.established_year || null,
          accreditation: profile.accreditation || '',
          coaching_staff_count: profile.coaching_staff_count || 0,
          total_students: profile.total_students || 0,
          successful_placements: profile.successful_placements || 0,
          equipment_provided: profile.equipment_provided || false,
          programs_offered: profile.programs_offered || [],
          age_groups: profile.age_groups || '',
          batch_timings: profile.batch_timings || [],
          fees_structure: profile.fees_structure || {},
          gallery_images: profile.gallery_images || [],
          facilities: profile.facilities || [],
          services_offered: profile.services_offered || [],
          achievements: profile.achievements || [],
          testimonials: profile.testimonials || []
        });
      } else {
        console.error('❌ Failed to fetch page data:', data.error);
        setError(data.error || 'Failed to fetch page data');
      }
    } catch (error) {
      console.error('❌ Error fetching page data:', error);
      setError('Failed to fetch page data');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Fetch category-specific details
  const fetchCategoryDetails = async () => {
    if (!pageId || !pageType) return;
    
    try {
      setLoadingDetails(true);
      const actualPageId = pageId?.startsWith('page_') ? pageId.substring(5) : pageId;
      
      let endpoint = '';
      if (pageType === 'academy') {
        endpoint = `http://localhost:5000/api/profiles/${actualPageId}/academy-details`;
      } else if (pageType === 'venue') {
        endpoint = `http://localhost:5000/api/profiles/${actualPageId}/venue-details`;
      } else if (pageType === 'community') {
        endpoint = `http://localhost:5000/api/profiles/${actualPageId}/community-details`;
      }
      
      if (endpoint) {
        console.log('🔄 Fetching category details from:', endpoint);
        const response = await fetch(endpoint);
        const data = await response.json();
        console.log('📡 Category details response:', data);
        
        if (data.success) {
          setCategoryDetails(data.details);
        } else {
          console.log('❌ Failed to fetch category details:', data.error);
        }
      }
    } catch (err) {
      console.error('Error fetching category details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const renderOverview = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Page Details</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button 
                onClick={handleEditPage}
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Card - Test Page Style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Page Header */}
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ 
                  background: pageType === 'academy' ? 'linear-gradient(to bottom right, #3B82F6, #1D4ED8)' :
                             pageType === 'venue' ? 'linear-gradient(to bottom right, #10B981, #059669)' :
                             pageType === 'community' ? 'linear-gradient(to bottom right, #F59E0B, #D97706)' :
                             'linear-gradient(to bottom right, #6B7280, #4B5563)'
                }}
              >
                {pageInfo.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{pageInfo.name}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pageType === 'academy' ? 'bg-blue-100 text-blue-800' :
                    pageType === 'venue' ? 'bg-green-100 text-green-800' :
                    pageType === 'community' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pageType ? pageType.charAt(0).toUpperCase() + pageType.slice(1) : 'Page'}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(pageInfo.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 mb-4">{pageInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Page Details */}
          <div className="border-t border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{pageInfo.location}</span>
                  </div>
                  {pageInfo.contact && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{pageInfo.contact}</span>
                    </div>
                  )}
                  {pageInfo.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{pageInfo.email}</span>
                    </div>
                  )}
                  {pageInfo.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a 
                        href={pageInfo.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {pageInfo.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Type-Specific Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                <div className="space-y-3">
                  {pageInfo.academy_type && (
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 capitalize">{pageInfo.academy_type.replace('_', ' ')}</span>
                    </div>
                  )}
                  {pageInfo.level && (
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 capitalize">{pageInfo.level.replace('_', ' ')}</span>
                    </div>
                  )}
                  {pageInfo.venue_type && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 capitalize">{pageInfo.venue_type.replace('_', ' ')}</span>
                    </div>
                  )}
                  {pageInfo.ground_type && (
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 capitalize">{pageInfo.ground_type.replace('_', ' ')}</span>
                    </div>
                  )}
                  {pageInfo.community_type && (
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 capitalize">{pageInfo.community_type.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(pageInfo.established_year || pageInfo.accreditation || pageInfo.coaching_staff_count > 0) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pageInfo.established_year && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{pageInfo.established_year}</div>
                      <div className="text-sm text-gray-600">Established</div>
                    </div>
                  )}
                  {pageInfo.coaching_staff_count > 0 && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{pageInfo.coaching_staff_count}</div>
                      <div className="text-sm text-gray-600">Coaching Staff</div>
                    </div>
                  )}
                  {pageInfo.total_students > 0 && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{pageInfo.total_students}</div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setActiveSection('create-post')}
          className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">Create Post</div>
            <div className="text-sm text-gray-600">Share updates</div>
          </div>
        </button>

        <button
          onClick={handleCreateJob}
          className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">Create Job</div>
            <div className="text-sm text-gray-600">Post opportunities</div>
          </div>
        </button>

        <button
          onClick={handleManagePosts}
          className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">Manage Post</div>
            <div className="text-sm text-gray-600">Edit & organize</div>
          </div>
        </button>

        <button
          onClick={handleAddMember}
          className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">Add Member</div>
            <div className="text-sm text-gray-600">Invite people</div>
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
        <button
              onClick={() => setActiveSection('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
            Posts
            <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
              {posts.length}
            </span>
            </button>
            <button
              onClick={() => setActiveSection('create-job')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === 'create-job'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
            Jobs
            <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
              {jobs.length}
            </span>
            </button>
            <button
              onClick={() => setActiveSection('add-member')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === 'add-member'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
            Members
            <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
              {members.length}
            </span>
            </button>
            <button
              onClick={() => setActiveSection('about')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === 'about'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              About
            </button>
            <button
              onClick={handleEditPage}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === 'edit-page'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Edit Page
            </button>
          </nav>
            </div>

        <div className="p-6">
          {/* Posts Tab Content */}
          {activeSection === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h3>
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-gray-400" />
          </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-4">Share your thoughts and experiences with the community!</p>
                  <button
                    onClick={() => setActiveSection('create-post')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Post
        </button>
      </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ background: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)' }}
                      >
                        {pageInfo.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">{pageInfo.name}</span>
                            <span className="text-gray-500">@{pageInfo.name.toLowerCase().replace(/\s+/g, '_')}</span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-900 mb-3">{post.content}</p>
                        <div className="flex items-center space-x-6 text-gray-500">
                          <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                            <Share className="w-4 h-4" />
                            <span>{post.shares}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Jobs Tab Content */}
          {activeSection === 'create-job' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Posted Jobs</h3>
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-600 mb-4">Share job opportunities with the community!</p>
                  <button
                    onClick={handleCreateJob}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Post Your First Job
                  </button>
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{pageInfo.name}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {job.type}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">{job.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{job.salary}</span>
                          <span className="text-sm text-gray-500">
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Members Tab Content */}
          {activeSection === 'add-member' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                  <p className="text-gray-600 mb-4">Invite people to join your team!</p>
                  <button
                    onClick={handleAddMember}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Member
                  </button>
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{ background: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)' }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          member.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : member.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-xs text-gray-500">Joined {member.joined_at}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* About Tab Content */}
          {activeSection === 'about' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {pageType === 'academy' && 'Academy Details'}
                {pageType === 'venue' && 'Venue Details'}
                {pageType === 'community' && 'Community Details'}
                {!pageType && 'Page Information'}
              </h3>
              {(() => {
                if (loadingDetails) {
                  return (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-gray-600">Loading details...</p>
                    </div>
                  );
                }

                if (!categoryDetails) {
                  return (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Info className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No details available</h3>
                      <p className="text-gray-600">Category-specific details not found for this page.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {pageType === 'academy' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Academy Information</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Academy Name</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.academy_name || 'Not specified'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.specialization || 'Not specified'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.established_year || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact & Location</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.address || 'Not specified'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.phone || 'Not specified'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.email || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg min-h-[100px]">{categoryDetails.description || 'No description available'}</p>
                        </div>
                      </>
                    )}

                    {pageType === 'venue' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Venue Information</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.venue_name || 'Not specified'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Type</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.venue_type || 'Not specified'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.capacity || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact & Location</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.address || 'Not specified'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.phone || 'Not specified'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.email || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg min-h-[100px]">{categoryDetails.description || 'No description available'}</p>
                        </div>
                      </>
                    )}

                    {pageType === 'community' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Community Information</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Community Name</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.community_name || 'Not specified'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Community Type</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.community_type || 'Not specified'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.founded_year || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact & Location</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.address || 'Not specified'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.phone || 'Not specified'}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.email || 'Not specified'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg min-h-[100px]">{categoryDetails.description || 'No description available'}</p>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCreatePost = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveSection('overview')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
        </div>
      </div>

      {/* Create Post Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleCreatePostSubmit} className="space-y-6">
          {/* Media Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Add Media</label>
            <div className="grid grid-cols-2 gap-4">
              {/* Image Upload */}
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                video ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' : 'border-gray-300 hover:border-orange-500'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={!!video}
                />
                <label htmlFor="image-upload" className={`cursor-pointer ${video ? 'cursor-not-allowed' : ''}`}>
                  <Image className={`w-8 h-8 mx-auto mb-2 ${video ? 'text-gray-300' : 'text-gray-400'}`} />
                  <p className={`text-sm ${video ? 'text-gray-400' : 'text-gray-600'}`}>Add Images</p>
                  <p className={`text-xs ${video ? 'text-gray-300' : 'text-gray-500'}`}>
                    {video ? 'Disabled when video is selected' : 'Click to select multiple images (up to 10)'}
                  </p>
                </label>
              </div>

              {/* Video Upload */}
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                images.length > 0 ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' : 'border-gray-300 hover:border-orange-500'
              }`}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                  disabled={images.length > 0}
                />
                <label htmlFor="video-upload" className={`cursor-pointer ${images.length > 0 ? 'cursor-not-allowed' : ''}`}>
                  <Video className={`w-8 h-8 mx-auto mb-2 ${images.length > 0 ? 'text-gray-300' : 'text-gray-400'}`} />
                  <p className={`text-sm ${images.length > 0 ? 'text-gray-400' : 'text-gray-600'}`}>Add Video</p>
                  <p className={`text-xs ${images.length > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                    {images.length > 0 ? 'Disabled when images are selected' : 'One video at a time'}
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Caption *</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption for your post... Use #hashtags and @mentions"
              className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-500">
                {caption.length}/500 characters
              </div>
              <div className="flex space-x-2">
                {extractHashtags(caption).map((hashtag, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {hashtag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Media Preview */}
          {(images.length > 0 || video) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Media Preview</label>
              
              {/* Images Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Video Preview */}
              {video && (
                <div className="relative">
                  <video 
                    src={video} 
                    controls 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you posting from?"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Visibility Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Who can see this post?</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                  visibility === 'public' 
                    ? 'border-orange-500 bg-orange-50 text-orange-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">Public</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibility('followers')}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                  visibility === 'followers' 
                    ? 'border-orange-500 bg-orange-50 text-orange-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">Followers</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                  visibility === 'private' 
                    ? 'border-orange-500 bg-orange-50 text-orange-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Hash className="w-4 h-4" />
                <span className="text-sm">Private</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
            <button 
              type="submit"
              disabled={(!caption.trim() && images.length === 0 && !video) || isCreating}
              className="px-8 py-3 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ background: 'linear-gradient(to right, #FF6B33, #2E4B5F)' }}
            >
              {isCreating ? 'Posting...' : 'Share Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderCreateJob = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveSection('overview')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Overview</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Posted Jobs</h2>
        </div>
      </div>

      {/* Jobs Data Display */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-600 mb-4">Share job opportunities with the community!</p>
            <button
              onClick={() => setActiveSection('create-job')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center space-x-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{pageInfo.name}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {job.type}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{job.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{job.salary}</span>
                    <span className="text-sm text-gray-500">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Job Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New Job</h3>
          <button
            onClick={() => setActiveSection('overview')}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Overview</span>
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleCreateJobSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Cricket Coach, Ground Staff"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Describe the role, responsibilities, and requirements..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                placeholder="e.g., Mumbai, India"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select 
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
              <input
                type="text"
                value={jobSalary}
                onChange={(e) => setJobSalary(e.target.value)}
                placeholder="e.g., ₹30,000 - ₹50,000"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
              <select 
                value={jobExperience}
                onChange={(e) => setJobExperience(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Posting...' : 'Post Job'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Existing Jobs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Posted Jobs</h3>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{job.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{job.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>📍 {job.location}</span>
                    <span>💰 {job.salary}</span>
                    <span>📅 {job.created_at}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-blue-600">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderManagePosts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveSection('overview')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Overview</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Manage Posts</h2>
        </div>
        <button
          onClick={() => setActiveSection('create-post')}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Post</span>
        </button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-3">{post.content}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>{post.likes} likes</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{post.comments} comments</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Share className="w-4 h-4" />
                    <span>{post.shares} shares</span>
                  </span>
                  <span>{post.created_at}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  post.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.status}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleEditPost(post)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Post Form */}
      {editingPost && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Edit Post</h3>
            <button
              onClick={() => {
                setEditingPost(null);
                setEditPostContent('');
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <form onSubmit={handleUpdatePost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Post Content *</label>
              <textarea
                rows={4}
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                placeholder="What's on your mind? Share your thoughts with the community..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Post'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingPost(null);
                  setEditPostContent('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  const renderAddMember = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveSection('overview')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Overview</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
        </div>
      </div>

      {/* Members Data Display */}
      <div className="space-y-4">
        {members.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
            <p className="text-gray-600 mb-4">Invite people to join your team!</p>
            <button
              onClick={() => setActiveSection('add-member')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Member
            </button>
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: 'linear-gradient(to bottom right, #FF6B33, #2E4B5F)' }}
              >
                {member.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    member.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : member.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{member.email}</p>
                <p className="text-xs text-gray-500">Joined {member.joined_at}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditMember(member)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit member"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteMember(member.member_id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Member Form */}
      {editingMember && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Edit Member</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveSection('overview')}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Overview</span>
              </button>
              <button
                onClick={() => {
                  setEditingMember(null);
                  setEditMemberName('');
                  setEditMemberEmail('');
                  setEditMemberRole('member');
                  setEditMemberStatus('pending');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleUpdateMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={editMemberName}
                onChange={(e) => setEditMemberName(e.target.value)}
                placeholder="Member name"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={editMemberEmail}
                onChange={(e) => setEditMemberEmail(e.target.value)}
                placeholder="member@example.com"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editMemberRole}
                  onChange={(e) => setEditMemberRole(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editMemberStatus}
                  onChange={(e) => setEditMemberStatus(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                  loading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Updating...' : 'Update Member'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingMember(null);
                  setEditMemberName('');
                  setEditMemberEmail('');
                  setEditMemberRole('member');
                  setEditMemberStatus('pending');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Member Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Invite New Member</h3>
          <button
            onClick={() => setActiveSection('overview')}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Overview</span>
          </button>
        </div>
        <form onSubmit={handleAddMemberSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="member@example.com"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select 
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
            <textarea
              rows={3}
              value={memberMessage}
              onChange={(e) => setMemberMessage(e.target.value)}
              placeholder="Add a personal message to the invitation..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Send Invitation</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Existing Members */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Members</h3>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-500">{member.email}</p>
                  <p className="text-xs text-gray-400">Joined {member.joined_at}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.role}
                </span>
                <button className="p-2 text-gray-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderJobs = () => {
    console.log('🎯 renderJobs called - loading:', loading, 'jobs:', jobs, 'jobs.length:', jobs.length);
    console.log('🎯 renderJobs - jobs array:', JSON.stringify(jobs, null, 2));
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveSection('overview')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Posted Jobs</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                console.log('🔄 Manual refresh jobs clicked');
                fetchJobs();
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleCreateJob}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post New Job
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Debug info */}
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg text-sm">
            <strong>Debug Info:</strong> Jobs count: {jobs.length}, Loading: {loading.toString()}, PageId: {pageId}
          </div>
          
          {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-600 mb-4">Share job opportunities with the community!</p>
            <button
              onClick={handleCreateJob}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.job_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center space-x-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{pageInfo.name}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {job.job_type}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{job.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Salary: {job.salary_range}</span>
                        <span>Experience: {job.experience_required}</span>
                        <span>Contact: {job.contact_email}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button 
                      onClick={() => handleEditJob(job)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit job"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteJob(job.job_id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Job Form */}
      {editingJob && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Edit Job</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveSection('overview')}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Overview</span>
              </button>
              <button
                onClick={() => {
                  setEditingJob(null);
                  setEditJobTitle('');
                  setEditJobDescription('');
                  setEditJobLocation('');
                  setEditJobSalary('');
                  setEditJobExperience('0-1');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleUpdateJob} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                type="text"
                value={editJobTitle}
                onChange={(e) => setEditJobTitle(e.target.value)}
                placeholder="e.g., Cricket Coach, Ground Staff"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea
                rows={4}
                value={editJobDescription}
                onChange={(e) => setEditJobDescription(e.target.value)}
                placeholder="Describe the role, responsibilities, and requirements..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={editJobLocation}
                onChange={(e) => setEditJobLocation(e.target.value)}
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  value={editJobType}
                  onChange={(e) => setEditJobType(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                <input
                  type="text"
                  value={editJobSalary}
                  onChange={(e) => setEditJobSalary(e.target.value)}
                  placeholder="e.g., 50000 - 80000"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
              <select
                value={editJobExperience}
                onChange={(e) => setEditJobExperience(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                  loading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Updating...' : 'Update Job'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingJob(null);
                  setEditJobTitle('');
                  setEditJobDescription('');
                  setEditJobLocation('');
                  setEditJobSalary('');
                  setEditJobExperience('0-1');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    );
  };

  const renderAbout = () => {
    const renderCategoryDetails = () => {
      if (loadingDetails) {
        return (
          <div className="text-center py-8">
            <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading details...</p>
          </div>
        );
      }

      if (!categoryDetails) {
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Info className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No details available</h3>
            <p className="text-gray-600">Category-specific details not found for this page.</p>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {pageType === 'academy' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Academy Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academy Name</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.academy_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.specialization || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.established_year || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact & Location</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.address || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.phone || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.email || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg min-h-[100px]">{categoryDetails.description || 'No description available'}</p>
              </div>
            </>
          )}

          {(pageType === 'venue' || pageType === 'pitch') && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Venue/Pitch Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Venue/Pitch Name</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.venue_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Venue Type</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.venue_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ground Type</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.ground_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.capacity || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Facility Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ground Length</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.ground_length ? `${categoryDetails.ground_length}m` : 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ground Width</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.ground_width ? `${categoryDetails.ground_width}m` : 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Floodlights</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.floodlights ? 'Available' : 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parking</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.parking_available ? 'Available' : 'Not available'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg min-h-[100px]">{categoryDetails.description || 'No description available'}</p>
              </div>
            </>
          )}

          {pageType === 'community' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Community Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Community Name</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.community_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Community Type</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.community_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.founded_year || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact & Location</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.address || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.phone || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{categoryDetails.email || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg min-h-[100px]">{categoryDetails.description || 'No description available'}</p>
              </div>
            </>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveSection('overview')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-900">About Page</h2>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {pageType === 'academy' && 'Academy Details'}
            {pageType === 'venue' && 'Venue Details'}
            {pageType === 'community' && 'Community Details'}
            {!pageType && 'Page Information'}
          </h3>
          {renderCategoryDetails()}
        </div>
      </div>
    );
  };

  const renderEditPage = () => {
    const renderAcademyFields = () => (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academy Name</label>
            <input
              type="text"
              value={editPageData.academy_name || ''}
              onChange={(e) => setEditPageData({...editPageData, academy_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academy Type</label>
            <select
              value={editPageData.academy_type || ''}
              onChange={(e) => setEditPageData({...editPageData, academy_type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Type</option>
              <option value="cricket_academy">Cricket Academy</option>
              <option value="sports_academy">Sports Academy</option>
              <option value="coaching_center">Coaching Center</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={editPageData.level || ''}
              onChange={(e) => setEditPageData({...editPageData, level: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="all_levels">All Levels</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Established Year</label>
            <input
              type="number"
              value={editPageData.established_year || ''}
              onChange={(e) => setEditPageData({...editPageData, established_year: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Accreditation</label>
          <input
            type="text"
            value={editPageData.accreditation || ''}
            onChange={(e) => setEditPageData({...editPageData, accreditation: e.target.value})}
            placeholder="e.g., BCCI Certified, State Association"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coaching Staff Count</label>
            <input
              type="number"
              value={editPageData.coaching_staff_count || ''}
              onChange={(e) => setEditPageData({...editPageData, coaching_staff_count: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Students</label>
            <input
              type="number"
              value={editPageData.total_students || ''}
              onChange={(e) => setEditPageData({...editPageData, total_students: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Successful Placements</label>
            <input
              type="number"
              value={editPageData.successful_placements || ''}
              onChange={(e) => setEditPageData({...editPageData, successful_placements: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editPageData.equipment_provided || false}
              onChange={(e) => setEditPageData({...editPageData, equipment_provided: e.target.checked})}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Equipment Provided</span>
          </label>
        </div>
      </>
    );

    const renderVenueFields = () => (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
            <input
              type="text"
              value={editPageData.venue_name || ''}
              onChange={(e) => setEditPageData({...editPageData, venue_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Venue Type</label>
            <select
              value={editPageData.venue_type || ''}
              onChange={(e) => setEditPageData({...editPageData, venue_type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Type</option>
              <option value="cricket_ground">Cricket Ground</option>
              <option value="indoor_pitch">Indoor Pitch</option>
              <option value="net_practice">Net Practice</option>
              <option value="multi_sport">Multi Sport</option>
              <option value="training_facility">Training Facility</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ground Type</label>
            <select
              value={editPageData.ground_type || ''}
              onChange={(e) => setEditPageData({...editPageData, ground_type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Type</option>
              <option value="turf">Turf</option>
              <option value="mat">Mat</option>
              <option value="concrete">Concrete</option>
              <option value="synthetic">Synthetic</option>
              <option value="natural">Natural</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
            <input
              type="number"
              value={editPageData.capacity || ''}
              onChange={(e) => setEditPageData({...editPageData, capacity: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ground Length (meters)</label>
            <input
              type="number"
              value={editPageData.ground_length || ''}
              onChange={(e) => setEditPageData({...editPageData, ground_length: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ground Width (meters)</label>
            <input
              type="number"
              value={editPageData.ground_width || ''}
              onChange={(e) => setEditPageData({...editPageData, ground_width: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pitch Count</label>
            <input
              type="number"
              value={editPageData.pitch_count || ''}
              onChange={(e) => setEditPageData({...editPageData, pitch_count: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Net Count</label>
            <input
              type="number"
              value={editPageData.net_count || ''}
              onChange={(e) => setEditPageData({...editPageData, net_count: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Booking Advance Days</label>
            <input
              type="number"
              value={editPageData.booking_advance_days || ''}
              onChange={(e) => setEditPageData({...editPageData, booking_advance_days: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editPageData.floodlights || false}
              onChange={(e) => setEditPageData({...editPageData, floodlights: e.target.checked})}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Floodlights</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editPageData.covered_area || false}
              onChange={(e) => setEditPageData({...editPageData, covered_area: e.target.checked})}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Covered Area</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editPageData.parking_available || false}
              onChange={(e) => setEditPageData({...editPageData, parking_available: e.target.checked})}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Parking</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editPageData.changing_rooms || false}
              onChange={(e) => setEditPageData({...editPageData, changing_rooms: e.target.checked})}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Changing Rooms</span>
          </label>
        </div>
      </>
    );

    const renderCommunityFields = () => (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Community Name</label>
            <input
              type="text"
              value={editPageData.community_name || ''}
              onChange={(e) => setEditPageData({...editPageData, community_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Community Type</label>
            <select
              value={editPageData.community_type || ''}
              onChange={(e) => setEditPageData({...editPageData, community_type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Type</option>
              <option value="local_club">Local Club</option>
              <option value="district_association">District Association</option>
              <option value="state_association">State Association</option>
              <option value="national_body">National Body</option>
              <option value="fan_club">Fan Club</option>
              <option value="players_association">Players Association</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Member Count</label>
            <input
              type="number"
              value={editPageData.member_count || ''}
              onChange={(e) => setEditPageData({...editPageData, member_count: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Active Members</label>
            <input
              type="number"
              value={editPageData.active_members || ''}
              onChange={(e) => setEditPageData({...editPageData, active_members: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Community Events Count</label>
            <input
              type="number"
              value={editPageData.community_events_count || ''}
              onChange={(e) => setEditPageData({...editPageData, community_events_count: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Membership Fee</label>
            <input
              type="number"
              value={editPageData.membership_fee || ''}
              onChange={(e) => setEditPageData({...editPageData, membership_fee: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Membership Duration</label>
            <input
              type="text"
              value={editPageData.membership_duration || ''}
              onChange={(e) => setEditPageData({...editPageData, membership_duration: e.target.value})}
              placeholder="e.g., 1 year, 6 months"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Community Rules</label>
          <textarea
            value={editPageData.community_rules || ''}
            onChange={(e) => setEditPageData({...editPageData, community_rules: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter community rules and guidelines..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Community Guidelines</label>
          <textarea
            value={editPageData.community_guidelines || ''}
            onChange={(e) => setEditPageData({...editPageData, community_guidelines: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter community guidelines..."
          />
        </div>
      </>
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveSection('overview')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              Edit {pageType === 'academy' ? 'Academy' : pageType === 'venue' ? 'Venue' : pageType === 'community' ? 'Community' : 'Page'}
            </h2>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSavePageEdit(); }} className="space-y-6">
            {/* Common Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Name</label>
                <input
                  type="text"
                  value={editPageData.name || ''}
                  onChange={(e) => setEditPageData({...editPageData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editPageData.description || ''}
                  onChange={(e) => setEditPageData({...editPageData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editPageData.location || ''}
                    onChange={(e) => setEditPageData({...editPageData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                  <input
                    type="text"
                    value={editPageData.contact || ''}
                    onChange={(e) => setEditPageData({...editPageData, contact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={editPageData.website || ''}
                  onChange={(e) => setEditPageData({...editPageData, website: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type-specific Fields */}
            {pageType === 'academy' && renderAcademyFields()}
            {pageType === 'venue' && renderVenueFields()}
            {pageType === 'community' && renderCommunityFields()}
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setActiveSection('overview')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                  loading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Removed CreatePost component usage - functionality integrated directly

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {activeSection === 'overview' && pageInfo.name}
            {activeSection === 'create-post' && 'Create Post'}
            {activeSection === 'create-job' && 'Create Job'}
            {activeSection === 'manage-posts' && 'Manage Posts'}
            {activeSection === 'add-member' && 'Add Member'}
            {activeSection === 'about' && 'About Page'}
          </h2>
        </div>
      </div>

      {/* Content */}
      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'create-post' && renderCreatePost()}
      {activeSection === 'create-job' && renderOverview()}
      {activeSection === 'create-job-form' && renderCreateJob()}
      {activeSection === 'manage-posts' && renderManagePosts()}
      {activeSection === 'add-member' && renderOverview()}
      {activeSection === 'add-member-form' && renderAddMember()}
      {activeSection === 'about' && renderOverview()}
      {activeSection === 'edit-page' && renderEditPage()}
    </div>
  );
}
