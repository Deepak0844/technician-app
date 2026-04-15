import React from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView, ScrollView , ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { removeDraft, clearAllDrafts } from '@store/slices/draftSlice';
import useTheme from '@hooks/useTheme';
import useSyncDrafts from '@hooks/useSyncDrafts';
import { ArrowLeft, Trash2, Calendar, Wrench, ChevronRight, CloudUpload, Zap } from 'lucide-react-native';

const DraftsListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const drafts = useSelector((state) => state.draft.drafts);
  const { syncAll, isSyncing } = useSyncDrafts();

  const handleDeleteDraft = (id) => {
    Alert.alert(
      "Delete Draft",
      "Are you sure you want to remove this draft? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => dispatch(removeDraft(id)) 
        }
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All",
      "Delete all pending drafts?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive", 
          onPress: () => dispatch(clearAllDrafts()) 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 64, borderBottomWidth: 1, borderBottomColor: colors.borderMuted }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <ArrowLeft color={colors.primary} size={20} />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>Local Drafts</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {drafts.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} disabled={isSyncing}>
              <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: '700', color: colors.danger, textTransform: 'uppercase', opacity: isSyncing ? 0.5 : 1 }}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {drafts.length > 0 && (
        <View style={{ padding: 20, paddingBottom: 0 }}>
          <TouchableOpacity 
            onPress={syncAll} 
            disabled={isSyncing}
            style={{ 
              backgroundColor: colors.primary, 
              height: 56, 
              borderRadius: 16, 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 12,
              shadowColor: colors.primary,
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 4
            }}
          >
            {isSyncing ? (
              <ActivityIndicator color={colors.bgPrimary} />
            ) : (
              <>
                <CloudUpload size={20} color={colors.bgPrimary} />
                <Text style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: '800', color: colors.bgPrimary, textTransform: 'uppercase', letterSpacing: 2 }}>Sync All to Server</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {drafts.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.bgSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Wrench size={32} color={colors.textDisabled} />
            </View>
            <Text style={{ fontFamily: 'Space Grotesk', fontSize: 18, color: colors.textPrimary, fontWeight: '700', marginBottom: 8 }}>No Drafts Found</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 40 }}>Your locally saved jobs will appear here for you to finish later.</Text>
          </View>
        ) : (
          drafts.map((item) => (
            <TouchableOpacity 
              key={item.id}
              onPress={() => navigation.navigate("AddJob", { draftId: item.id })}
              activeOpacity={0.8}
              style={{ 
                backgroundColor: colors.bgCard, 
                borderRadius: 16, 
                padding: 16, 
                marginBottom: 16, 
                borderWidth: 1, 
                borderColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Calendar size={20} color={colors.primary} />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>
                  {item.customerName || "Unnamed Customer"}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                   <Text style={{ fontFamily: 'Inter', fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', fontWeight: '700' }}>
                     {item.applianceType || "Unknown Device"}
                   </Text>
                   <Text style={{ color: colors.textDisabled }}>•</Text>
                   <Text style={{ fontFamily: 'Inter', fontSize: 10, color: colors.textDisabled }}>
                     Saved {new Date(item.lastSaved).toLocaleDateString()}
                   </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity 
                  onPress={() => handleDeleteDraft(item.id)}
                  style={{ padding: 8 }}
                >
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
                <ChevronRight size={16} color={colors.textDisabled} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DraftsListScreen;
