import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Check, Plus, Sparkles, Hash, ListFilter, Tag } from "lucide-react";
import { amenitiesAPI, siteAmenitiesAPI, sitesAPI } from "../../../services/api";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import ViewToggle from "../../../components/ui/ViewToggle";
import Modal from "../../../components/ui/Modal";

export default function WizardAmenityStep({ siteId: initialSiteId, onNext, onBack }) {
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState(
    initialSiteId ? String(initialSiteId) : ""
  );
  const [sitesLoading, setSitesLoading] = useState(true);
  const [amenities, setAmenities] = useState([]);
  const [siteAmenities, setSiteAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (initialSiteId) setSelectedSiteId(String(initialSiteId));
  }, [initialSiteId]);

  useEffect(() => {
    if (selectedSiteId) fetchData();
    else setSiteAmenities([]);
  }, [selectedSiteId]);

  const fetchSites = async () => {
    setSitesLoading(true);
    try {
      const res = await sitesAPI.list();
      const list = res?.results || res || [];
      setSites(list);
      setSelectedSiteId((prev) => {
        const preferred = initialSiteId ? String(initialSiteId) : "";
        if (preferred && list.some((s) => String(s.id) === preferred)) return preferred;
        if (prev && list.some((s) => String(s.id) === prev)) return prev;
        return list[0] ? String(list[0].id) : "";
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSitesLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [amRes, saRes] = await Promise.all([
        amenitiesAPI.list(),
        selectedSiteId ? siteAmenitiesAPI.list({ site: selectedSiteId }) : Promise.resolve([]),
      ]);
      setAmenities(amRes?.results || amRes || []);
      setSiteAmenities(saRes?.results || saRes || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const siteAmenityMap = {};
  siteAmenities.forEach((sa) => {
    siteAmenityMap[sa.amenity] = sa.id;
  });

  const handleToggle = async (amenityId) => {
    if (!selectedSiteId) return;
    setToggling(amenityId);
    try {
      if (siteAmenityMap[amenityId]) {
        await siteAmenitiesAPI.delete(siteAmenityMap[amenityId]);
        toast.success("Amenity removed");
      } else {
        await siteAmenitiesAPI.create({ site: parseInt(selectedSiteId, 10), amenity: amenityId });
        toast.success("Amenity added");
      }
      const saRes = await siteAmenitiesAPI.list({ site: selectedSiteId });
      setSiteAmenities(saRes?.results || saRes || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToggling(null);
    }
  };

  const openModal = () => {
    setNewName("");
    setNewCode("");
    setShowModal(true);
  };

  const handleAddAmenity = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await amenitiesAPI.create({ name: newName, code: newCode });
      toast.success("Amenity created");
      setShowModal(false);
      setNewName("");
      setNewCode("");
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const amenityColumns = [
    { key: "name", label: "Name", render: (row) => row.name || "-" },
    { key: "code", label: "Code", render: (row) => row.code || "-" },
    {
      key: "linked",
      label: "Selected",
      render: (row) => (siteAmenityMap[row.id] ? "Yes" : "No"),
    },
    {
      key: "action",
      label: "Action",
      className: "w-28",
      render: (row) => {
        const isLinked = !!siteAmenityMap[row.id];
        const isToggling = toggling === row.id;
        return (
          <button
            type="button"
            disabled={isToggling}
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(row.id);
            }}
            className={`text-xs font-medium px-2 py-1 rounded-md border transition-colors cursor-pointer disabled:opacity-60 ${
              isLinked
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {isLinked ? "Remove" : "Add"}
          </button>
        );
      },
    },
  ];

  if (sitesLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div>
        <Card className="p-8 text-center text-sm text-gray-500">
          No sites found. Create a site in Step 1 first.
        </Card>
        <div className="flex justify-between mt-8">
          <Button variant="secondary" onClick={onBack}>Back</Button>
          <Button onClick={onNext}>Skip</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Section */}
      <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 rounded-r-lg mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ListFilter className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-semibold text-gray-700">Filter</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Site"
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            options={sites.map((s) => ({ value: String(s.id), label: s.name }))}
          />
        </div>
      </div>

      {/* Amenities Section */}
      <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 bg-gray-50 rounded-r-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700">
              Toggle amenities for this site
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {amenities.length > 0 && <ViewToggle value={viewMode} onChange={setViewMode} />}
            <Button size="sm" icon={Plus} onClick={openModal}>New Amenity</Button>
          </div>
        </div>

        {amenities.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No amenities defined yet. Create one above.</p>
        ) : viewMode === "grid" ? (
          <div className="flex flex-wrap gap-2">
            {amenities.map((am) => {
              const isLinked = !!siteAmenityMap[am.id];
              const isToggling = toggling === am.id;
              return (
                <button
                  key={am.id}
                  disabled={isToggling}
                  onClick={() => handleToggle(am.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer disabled:opacity-60 ${
                    isLinked
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {isLinked && <Check className="w-3.5 h-3.5" />}
                  {am.name}
                </button>
              );
            })}
          </div>
        ) : (
          <Card className="p-0">
            <DataTable columns={amenityColumns} data={amenities} emptyMessage="No amenities found" />
          </Card>
        )}
      </div>

      {/* New Amenity Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Amenity" size="sm">
        <form onSubmit={handleAddAmenity}>
          <div className="border-l-2 border-emerald-500 pl-5 py-4 pr-5 rounded-r-lg">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-700">Amenity Details</h4>
            </div>
            <div className="space-y-4">
              <Input label="Name" icon={Sparkles} value={newName} onChange={(e) => setNewName(e.target.value)} required />
              <Input label="Code" icon={Hash} value={newCode} onChange={(e) => setNewCode(e.target.value)} required placeholder="e.g. swimming-pool" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-5">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" icon={Plus} loading={adding}>Add Amenity</Button>
          </div>
        </form>
      </Modal>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>{amenities.length === 0 ? "Skip" : "Next"}</Button>
      </div>
    </div>
  );
}
