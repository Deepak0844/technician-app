import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Users, Search, Phone } from 'lucide-react-native';
import useTheme from '@hooks/useTheme';

const CustomerSelector = ({ 
  selectedCustomer, 
  setSelectedCustomer, 
  topRecent, 
  onSearchPress 
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 32, overflow: 'hidden', borderRadius: 16, backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ backgroundColor: colors.bgCard, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: '700', color: colors.secondary, letterSpacing: 4, textTransform: 'uppercase' }}>Customer Details</Text>
        <Users size={12} color={colors.secondary} />
      </View>
      
      <View style={{ padding: 20 }}>
        {!selectedCustomer ? (
          <View>
            <TouchableOpacity 
              onPress={onSearchPress}
              style={{ paddingVertical: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.secondaryBorder, borderRadius: 12, backgroundColor: colors.secondaryBg, marginBottom: 16 }}
            >
              <Search size={20} color={colors.secondary} />
              <Text style={{ fontFamily: 'Space Grotesk', color: colors.secondary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 4, marginTop: 8 }}>Search Customers</Text>
            </TouchableOpacity>

            {topRecent.length > 0 && (
              <View>
                <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontSize: 7, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 4, marginBottom: 12, marginLeft: 4 }}>Recent Customers</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {topRecent.map((c) => (
                    <TouchableOpacity 
                      key={c._id} 
                      onPress={() => setSelectedCustomer(c)}
                      style={{ marginRight: 8, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minWidth: 80 }}
                    >
                      <Text style={{ fontFamily: 'Space Grotesk', color: colors.textPrimary, fontSize: 10, fontWeight: '700' }}>{c.name.split(' ')[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontFamily: 'Space Grotesk', color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>{selectedCustomer.name}</Text>
                <View style={{ backgroundColor: colors.secondaryBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, borderWidth: 1, borderColor: colors.secondaryBorder }}>
                   <Text style={{ color: colors.secondary, fontSize: 7, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>Verified</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Phone size={10} color={colors.secondary} />
                <Text style={{ fontFamily: 'Inter', color: colors.textDisabled, fontSize: 10, textTransform: 'uppercase', fontWeight: '700' }}>PHONE: {selectedCustomer.phone}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => setSelectedCustomer(null)}
              style={{ backgroundColor: colors.bgCard, padding: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border }}
            >
              <Search size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default CustomerSelector;
