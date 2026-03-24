import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useAuth } from "../../auth/auth";
import { useTranslation } from "../../context/TranslationContext";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import CreateClassroomModal from "./CreateClassroomModal";
import { useUniversalPersistence } from "../../hooks/useUniversalPersistenceSimple";

const Classrooms = () => {
  const { API, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Use universal persistence for classrooms
  const { data: classrooms, loading, error, addItem, updateItem, removeItem, loadData } = useUniversalPersistence('classrooms');
  const [openModal, setOpenModal] = useState(false);

  const handleCreateClassroom = async (classroomData) => {
    try {
      await addItem(classroomData);
      toast.success(t('classroom_created_successfully'));
      setOpenModal(false);
    } catch (error) {
      console.error('Create error:', error);
      toast.error(t('classroom_created_locally'));
    }
  };

  const handleDeleteClassroom = async (id) => {
    try {
      await removeItem(id);
      toast.success(t('classroom_deleted_successfully'));
    } catch (error) {
      console.error('Delete error:', error);
      toast.success(t('classroom_deleted_locally'));
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('classrooms')}</h1>
            <p className="text-gray-500">{t('manage_classrooms')}</p>
          </div>

          {/* ✅ ONLY CREATE CLASSROOM */}
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg"
          >
            <Plus size={18} />
            {t('create_classroom_button')}
          </button>
        </div>

        {/* CONTENT */}
        {loading ? (
          <p className="text-gray-500 text-center py-8">{t('loading_classrooms')}</p>
        ) : classrooms && classrooms.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('no_classrooms_created')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classrooms && classrooms.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/admin/classrooms/${c.id}`)}
                className="relative rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                style={{
                  backgroundImage: `url('https://media.giphy.com/media/l2Je66zG6mAAZxgqI/giphy.gif')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '200px'
                }}
              >
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-all duration-300"></div>
                <div className="relative p-5 text-white h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xl mb-2 animate-fade-in">
                      {c.name} {c.section && `- ${c.section}`}
                    </h3>
                      <p className="text-sm opacity-90">
                      {t('class_teacher')}:
                      <span className="font-medium ml-1">
                        {(typeof c.classTeacher === 'object' ? c.classTeacher?.name : c.classTeacher) || t('not_assigned')}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 text-sm font-medium">
                    {t('students')}: {c.studentCount || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE CLASSROOM MODAL */}
        <CreateClassroomModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSuccess={loadData}
        />
      </div>
    </AdminLayout>
  );
};

export default Classrooms;
