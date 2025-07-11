import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface Company {
  id: number;
  symbol: string;
  company_name: string | null;
  series: string;
  is_active: boolean;
}

interface HierarchyLevel {
  id: number;
  name: string;
  count: number;
}

interface ApiResponse {
  status: string;
  data: {
    companies: Company[];
    hierarchy: {
      sectors?: HierarchyLevel[];
      industries?: HierarchyLevel[];
      igroups?: HierarchyLevel[];
      isubgroups?: HierarchyLevel[];
    };
    current_path: {
      sector_id?: number;
      sector_name?: string;
      industry_id?: number;
      industry_name?: string;
      igroup_id?: number;
      igroup_name?: string;
      isubgroup_id?: number;
      isubgroup_name?: string;
    };
    total_companies: number;
  };
}

const CompaniesPage: React.FC = () => {
  const { sectorId, industryId, igroupId, isubgroupId } = useParams<{
    sectorId?: string;
    industryId?: string;
    igroupId?: string;
    isubgroupId?: string;
  }>();
  
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [hierarchy, setHierarchy] = useState<any>({});
  const [currentPath, setCurrentPath] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedSector, setSelectedSector] = useState<string>(sectorId || 'all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>(industryId || 'all');
  const [selectedGroup, setSelectedGroup] = useState<string>(igroupId || 'all');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        // Build the API URL based on the current path
        let url = '/api/companies';
        if (sectorId) {
          url += `/${sectorId}`;
          if (industryId) {
            url += `/${industryId}`;
            if (igroupId) {
              url += `/${igroupId}`;
              if (isubgroupId) {
                url += `/${isubgroupId}`;
              }
            }
          }
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data: ApiResponse = await response.json();
          console.log('API Response:', data); // Debug log
          if (data.status === 'success') {
            setCompanies(data.data.companies);
            setHierarchy(data.data.hierarchy);
            setCurrentPath(data.data.current_path);
            
            // Update selectedSector based on current path
            if (data.data.current_path.sector_id) {
              setSelectedSector(data.data.current_path.sector_id.toString());
            }
            
            // Update selectedIndustry based on current path
            if (data.data.current_path.industry_id) {
              setSelectedIndustry(data.data.current_path.industry_id.toString());
            }
            
            // Update selectedGroup based on current path
            if (data.data.current_path.igroup_id) {
              setSelectedGroup(data.data.current_path.igroup_id.toString());
            }
            
            console.log('Hierarchy data:', data.data.hierarchy); // Debug log
          } else {
            toast.error(data.status || 'Failed to fetch companies');
          }
        } else {
          toast.error('Failed to fetch companies');
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast.error('Error fetching companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [sectorId, industryId, igroupId, isubgroupId]);

  const handleHierarchyClick = (type: string, id: number, name: string) => {
    let newPath = '/companies';
    
    switch (type) {
      case 'sector':
        newPath = `/companies/${id}`;
        break;
      case 'industry':
        newPath = `/companies/${sectorId}/${id}`;
        break;
      case 'igroup':
        newPath = `/companies/${sectorId}/${industryId}/${id}`;
        break;
      case 'isubgroup':
        newPath = `/companies/${sectorId}/${industryId}/${igroupId}/${id}`;
        break;
    }
    
    navigate(newPath);
  };

  const filteredCompanies = companies
    .filter(company => company.company_name !== null); // Only show companies with names

  // Calculate pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredCompanies.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getBreadcrumbPath = () => {
    const path = [];
    if (currentPath.sector_name) {
      path.push({
        name: currentPath.sector_name,
        type: 'sector',
        id: currentPath.sector_id
      });
    }
    if (currentPath.industry_name) {
      path.push({
        name: currentPath.industry_name,
        type: 'industry',
        id: currentPath.industry_id
      });
    }
    if (currentPath.igroup_name) {
      path.push({
        name: currentPath.igroup_name,
        type: 'igroup',
        id: currentPath.igroup_id
      });
    }
    if (currentPath.isubgroup_name) {
      path.push({
        name: currentPath.isubgroup_name,
        type: 'isubgroup',
        id: currentPath.isubgroup_id
      });
    }
    return path;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading companies...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-4 mb-6">
        <h1 className="text-3xl text-gray-900">Companies</h1>
        <p className="text-gray-500 text-base mt-1">
          Browse companies by sector and industry classification
        </p>
      </div>



      {/* Debug Info */}
      {/* <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
        <h3 className="font-medium text-yellow-800 mb-2">Debug Info:</h3>
        <p className="text-sm text-yellow-700">sectorId: {sectorId}</p>
        <p className="text-sm text-yellow-700">selectedSector: {selectedSector}</p>
        <p className="text-sm text-yellow-700">hierarchy.sectors exists: {hierarchy.sectors ? 'Yes' : 'No'}</p>
        <p className="text-sm text-yellow-700">hierarchy.sectors length: {hierarchy.sectors?.length || 0}</p>
        <p className="text-sm text-yellow-700">hierarchy object: {JSON.stringify(hierarchy)}</p>
        <p className="text-sm text-yellow-700">currentPath: {JSON.stringify(currentPath)}</p>
      </div> */}

      {/* Sector and Industry Filters */}
      {(hierarchy.sectors || hierarchy.industries) && (
        <div className="mb-4">
          <div className="flex gap-4">
            {/* Sector Dropdown */}
            <div className="flex flex-col gap-2 w-1/4">
              <label htmlFor="sector-select" className="text-sm text-gray-700 font-medium">
                Sector:
              </label>
              <select
                id="sector-select"
                value={selectedSector}
                onChange={(e) => {
                  setSelectedSector(e.target.value);
                  setSelectedIndustry('all'); // Reset industry when sector changes
                }}
                className="border rounded px-3 py-2 text-sm w-full"
              >
                <option value="all">All Sectors</option>
                {/* Show all sectors from hierarchy */}
                {hierarchy.sectors?.map((sector: HierarchyLevel) => (
                  <option key={sector.id} value={sector.id.toString()}>
                    {sector.name} ({sector.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Industry Dropdown - Show when a sector is selected or when accessing via URL */}
            {(selectedSector !== 'all' || sectorId) && (
              <div className="flex flex-col gap-2 w-1/4">
                <label htmlFor="industry-select" className="text-sm text-gray-700 font-medium">
                  Industry:
                </label>
                <select
                  id="industry-select"
                  value={selectedIndustry}
                  onChange={(e) => {
                    setSelectedIndustry(e.target.value);
                    setSelectedGroup('all'); // Reset group when industry changes
                    if (e.target.value !== 'all') {
                      const industry = hierarchy.industries?.find((i: HierarchyLevel) => i.id.toString() === e.target.value);
                      if (industry && (selectedSector !== 'all' || sectorId)) {
                        const currentSectorId = selectedSector !== 'all' ? selectedSector : sectorId;
                        const sector = hierarchy.sectors?.find((s: HierarchyLevel) => s.id.toString() === currentSectorId);
                        if (sector) {
                          // Navigate to the industry within the selected sector
                          navigate(`/companies/${sector.id}/${industry.id}`);
                        }
                      }
                    }
                  }}
                  className="border rounded px-3 py-2 text-sm w-full"
                >
                  <option value="all">All Industries</option>
                  {hierarchy.industries?.map((industry: HierarchyLevel) => (
                    <option key={industry.id} value={industry.id.toString()}>
                      {industry.name} ({industry.count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Group Dropdown - Show when an industry is selected or when accessing via URL */}
            {(selectedIndustry !== 'all' || industryId) && (
              <div className="flex flex-col gap-2 w-1/4">
                <label htmlFor="group-select" className="text-sm text-gray-700 font-medium">
                  Group:
                </label>
                <select
                  id="group-select"
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    if (e.target.value !== 'all') {
                      const group = hierarchy.igroups?.find((g: HierarchyLevel) => g.id.toString() === e.target.value);
                      if (group && (selectedIndustry !== 'all' || industryId)) {
                        const currentSectorId = selectedSector !== 'all' ? selectedSector : sectorId;
                        const currentIndustryId = selectedIndustry !== 'all' ? selectedIndustry : industryId;
                        const sector = hierarchy.sectors?.find((s: HierarchyLevel) => s.id.toString() === currentSectorId);
                        const industry = hierarchy.industries?.find((i: HierarchyLevel) => i.id.toString() === currentIndustryId);
                        if (sector && industry) {
                          // Navigate to the group within the selected sector and industry
                          navigate(`/companies/${sector.id}/${industry.id}/${group.id}`);
                        }
                      }
                    }
                  }}
                  className="border rounded px-3 py-2 text-sm w-full"
                >
                  <option value="all">All Groups</option>
                  {hierarchy.igroups?.map((group: HierarchyLevel) => (
                    <option key={group.id} value={group.id.toString()}>
                      {group.name} ({group.count})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Companies Table */}
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full bg-white" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3 text-left w-1/2">
                Company Name
              </th>
              <th className="px-4 py-3 text-left w-1/2">
                Symbol
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                  No companies found
                </td>
              </tr>
            ) : (
              currentData.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a
                      href={`/stocks/${encodeURIComponent(company.symbol)}`}
                      className="text-gray-900 hover:text-gray-700"
                    >
                      {company.company_name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {company.symbol}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          Rows per page
          <select 
            value={itemsPerPage} 
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span>
            {startIndex + 1}-{Math.min(endIndex, filteredCompanies.length)} of {filteredCompanies.length}
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-gray-100 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-7 h-7 flex items-center justify-center rounded border text-sm ${
                    currentPage === page
                      ? 'border-blue-200 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                {currentPage > 3 && <span className="px-2">...</span>}
                {currentPage > 3 && (
                  <button
                    onClick={() => handlePageChange(currentPage)}
                    className="w-7 h-7 flex items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-700 font-semibold text-sm"
                  >
                    {currentPage}
                  </button>
                )}
                {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                {currentPage < totalPages - 2 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-700 text-sm"
                  >
                    {totalPages}
                  </button>
                )}
              </>
            )}
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-gray-100 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage; 