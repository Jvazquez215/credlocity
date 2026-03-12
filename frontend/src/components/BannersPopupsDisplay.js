import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const BannersPopupsDisplay = () => {
  const [banners, setBanners] = useState([]);
  const [popups, setPopups] = useState([]);
  const [dismissedItems, setDismissedItems] = useState([]);
  const [shownPopups, setShownPopups] = useState(new Set());

  useEffect(() => {
    fetchActiveBannersPopups();
    
    // Load dismissed items from localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissedBannersPopups') || '[]');
    setDismissedItems(dismissed);
  }, []);

  const fetchActiveBannersPopups = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/banners-popups`);
      if (response.ok) {
        const items = await response.json();
        const currentPath = window.location.pathname;
        
        // Filter items based on display_pages rules
        const filteredItems = items.filter(item => {
          // If display_pages is empty, show on all pages
          if (!item.display_pages || item.display_pages.length === 0) {
            return true;
          }
          // Otherwise, check if current path matches any of the specified pages
          return item.display_pages.some(page => currentPath.includes(page));
        });
        
        setBanners(filteredItems.filter(item => item.type === 'banner'));
        setPopups(filteredItems.filter(item => item.type === 'popup'));
      }
    } catch (error) {
      console.error('Error fetching banners/popups:', error);
    }
  };

  const handleDismiss = (itemId) => {
    const newDismissed = [...dismissedItems, itemId];
    setDismissedItems(newDismissed);
    localStorage.setItem('dismissedBannersPopups', JSON.stringify(newDismissed));
  };

  const handlePopupTrigger = (popup) => {
    if (shownPopups.has(popup.id) || dismissedItems.includes(popup.id)) {
      return;
    }

    const delay = popup.delay || 0;
    
    switch (popup.trigger) {
      case 'onload':
        setTimeout(() => {
          setShownPopups(prev => new Set([...prev, popup.id]));
        }, delay * 1000);
        break;
        
      case 'timed':
        setTimeout(() => {
          setShownPopups(prev => new Set([...prev, popup.id]));
        }, delay * 1000);
        break;
        
      case 'onscroll':
        const handleScroll = () => {
          const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
          if (scrollPercentage > 50) { // Show after 50% scroll
            setTimeout(() => {
              setShownPopups(prev => new Set([...prev, popup.id]));
            }, delay * 1000);
            window.removeEventListener('scroll', handleScroll);
          }
        };
        window.addEventListener('scroll', handleScroll);
        break;
        
      case 'onexit':
        const handleMouseLeave = (e) => {
          if (e.clientY < 10) { // Mouse near top of screen
            setTimeout(() => {
              setShownPopups(prev => new Set([...prev, popup.id]));
            }, delay * 1000);
            document.removeEventListener('mouseleave', handleMouseLeave);
          }
        };
        document.addEventListener('mouseleave', handleMouseLeave);
        break;
        
      default:
        break;
    }
  };

  useEffect(() => {
    popups.forEach(popup => {
      handlePopupTrigger(popup);
    });
  }, [popups]);

  const renderBanner = (banner) => {
    if (dismissedItems.includes(banner.id)) {
      return null;
    }

    const positionClasses = {
      top: 'top-16',
      bottom: 'bottom-0',
      floating: 'bottom-4'
    };

    const containerClasses = banner.position === 'floating' 
      ? 'left-1/2 transform -translate-x-1/2 max-w-4xl rounded-lg shadow-lg'
      : 'left-0 right-0';

    return (
      <div
        key={banner.id}
        className={`fixed ${positionClasses[banner.position]} ${containerClasses} z-50 animate-in slide-in-from-top duration-500`}
        style={{
          backgroundColor: banner.background_color,
          color: banner.text_color
        }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{banner.title}</h3>
            <div 
              className="text-sm opacity-90"
              dangerouslySetInnerHTML={{ __html: banner.content }}
            />
          </div>
          {banner.cta_text && banner.cta_link && (
            <a
              href={banner.cta_link}
              className="ml-4 px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              {banner.cta_text}
            </a>
          )}
          {banner.dismissible && (
            <button
              onClick={() => handleDismiss(banner.id)}
              className="ml-4 p-1 hover:opacity-70 transition-opacity"
              aria-label="Dismiss banner"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderPopup = (popup) => {
    if (!shownPopups.has(popup.id) || dismissedItems.includes(popup.id)) {
      return null;
    }

    return (
      <div
        key={popup.id}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-300"
      >
        <div
          className="relative max-w-lg w-full mx-4 rounded-lg shadow-2xl p-6 animate-in zoom-in-95 duration-300"
          style={{
            backgroundColor: popup.background_color,
            color: popup.text_color
          }}
        >
          {popup.dismissible && (
            <button
              onClick={() => handleDismiss(popup.id)}
              className="absolute top-4 right-4 p-1 hover:opacity-70 transition-opacity"
              aria-label="Close popup"
            >
              <X size={24} />
            </button>
          )}
          
          <h2 className="text-2xl font-bold mb-4 pr-8">{popup.title}</h2>
          <div 
            className="mb-6 opacity-90"
            dangerouslySetInnerHTML={{ __html: popup.content }}
          />
          
          {popup.cta_text && popup.cta_link && (
            <a
              href={popup.cta_link}
              className="inline-block px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {popup.cta_text}
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Render Banners */}
      {banners.map(banner => renderBanner(banner))}
      
      {/* Render Popups */}
      {popups.map(popup => renderPopup(popup))}
    </>
  );
};

export default BannersPopupsDisplay;
