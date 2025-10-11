import { DocumentData } from 'firebase/firestore';
import { useState } from 'react';
import { firestoreService } from '../services/firebase';

interface FirestoreState {
  loading: boolean;
  error: string | null;
  data: DocumentData | null;
}

export const useFirestore = () => {
  const [state, setState] = useState<FirestoreState>({
    loading: false,
    error: null,
    data: null,
  });

  const createDocument = async (
    collectionName: string,
    docId: string,
    data: any
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await firestoreService.createDoc(collectionName, docId, data);
      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to create document' 
      }));
      throw error;
    }
  };

  const getDocument = async (collectionName: string, docId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await firestoreService.getDoc(collectionName, docId);
      setState(prev => ({ ...prev, loading: false, data: data || null }));
      return data;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to get document' 
      }));
      throw error;
    }
  };

  const updateDocument = async (
    collectionName: string,
    docId: string,
    data: any
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await firestoreService.updateDoc(collectionName, docId, data);
      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to update document' 
      }));
      throw error;
    }
  };

  const deleteDocument = async (collectionName: string, docId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await firestoreService.deleteDoc(collectionName, docId);
      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to delete document' 
      }));
      throw error;
    }
  };

  const queryDocuments = async (
    collectionName: string,
    constraints: any[] = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'asc',
    limitCount?: number
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const snapshot = await firestoreService.queryDocs(
        collectionName,
        constraints,
        orderByField,
        orderDirection,
        limitCount
      );
      setState(prev => ({ ...prev, loading: false }));
      return snapshot;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to query documents' 
      }));
      throw error;
    }
  };

  const queryByField = async (
    collectionName: string,
    field: string,
    operator: any,
    value: any
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const snapshot = await firestoreService.queryByField(
        collectionName,
        field,
        operator,
        value
      );
      setState(prev => ({ ...prev, loading: false }));
      return snapshot;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to query by field' 
      }));
      throw error;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
    queryByField,
    clearError,
  };
};
