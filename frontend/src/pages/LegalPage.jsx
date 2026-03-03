import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LegalPage = () => {
    const { slug } = useParams();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchDocument = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/legal/${slug}`);
                setDocument(response.data);
            } catch (err) {
                setError('Document not found');
            } finally {
                setLoading(false);
            }
        };
        fetchDocument();
    }, [slug]);
    
    if (loading) {
        return (
            <div className="min-h-screen bg-obsidian pt-24 pb-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }
    
    if (error || !document) {
        return (
            <div className="min-h-screen bg-obsidian pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/"
                        className="inline-flex items-center text-zinc-400 hover:text-gold transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <div className="glass-card border-zinc-800 p-8 text-center">
                        <h1 className="text-2xl font-serif font-bold text-white mb-4">Document Not Found</h1>
                        <p className="text-zinc-400">The requested document could not be found.</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-obsidian pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    to="/"
                    className="inline-flex items-center text-zinc-400 hover:text-gold transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
                
                <h1 className="text-3xl font-serif font-bold text-white mb-8">{document.title}</h1>
                
                <div className="glass-card border-zinc-800 p-8">
                    <div 
                        className="prose prose-invert prose-zinc max-w-none text-zinc-300 
                        prose-headings:text-white prose-headings:font-serif
                        prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-4
                        prose-p:leading-relaxed prose-p:mb-4
                        prose-ul:list-disc prose-ul:pl-6
                        prose-li:mb-2"
                        dangerouslySetInnerHTML={{ __html: document.content.replace(/\n/g, '<br/>') }}
                    />
                </div>
                
                {document.updated_at && (
                    <p className="text-zinc-600 text-sm mt-4">
                        Last updated: {new Date(document.updated_at).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LegalPage;
