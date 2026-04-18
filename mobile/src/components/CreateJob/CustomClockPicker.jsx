import React, { useState } from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity } from 'react-native';
import useTheme from '@hooks/useTheme';

const CustomClockPicker = ({ visible, onClose, selectedTime, onSelectTime }) => {
  const { colors } = useTheme();
  const [clockPickerMode, setClockPickerMode] = useState("hour"); // "hour" or "minute"

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <Pressable style={{ backgroundColor: colors.bgCard, padding: 24, paddingBottom: 48, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontFamily: 'Space Grotesk', color: colors.textPrimary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>Set Appointment Time</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>SET</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center justify-center py-6">
             {/* Clock Face Toggle */}
             <View className="flex-row rounded-full p-1 mb-10 border border-white/5" style={{ backgroundColor: colors.bgInput }}>
                <TouchableOpacity 
                  onPress={() => setClockPickerMode("hour")}
                  className="px-6 py-1.5 rounded-full"
                  style={{ backgroundColor: clockPickerMode === "hour" ? colors.primaryBgStrong : 'transparent' }}
                >
                  <Text style={{ fontFamily: 'Space Grotesk', color: clockPickerMode === "hour" ? colors.textPrimary : colors.textDisabled }} className="text-[10px] uppercase font-bold">Hour</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setClockPickerMode("minute")}
                  className="px-6 py-1.5 rounded-full"
                  style={{ backgroundColor: clockPickerMode === "minute" ? colors.secondaryBg : 'transparent' }}
                >
                  <Text style={{ fontFamily: 'Space Grotesk', color: clockPickerMode === "minute" ? colors.textPrimary : colors.textDisabled }} className="text-[10px] uppercase font-bold">Minute</Text>
                </TouchableOpacity>
             </View>

             {/* Radial Clock Face */}
             <View className="w-64 h-64 items-center justify-center relative">
                {/* AM/PM Toggle in Center */}
                <View className="z-20 w-16 h-16 rounded-full items-center justify-center border border-white/10" style={{ backgroundColor: colors.bgCard, shadowColor: colors.primary, shadowOpacity: 0.1, shadowRadius: 20 }}>
                   <TouchableOpacity onPress={() => {
                     const t = selectedTime || "10:00 AM";
                     const [timePart] = t.split(' ');
                     onSelectTime(`${timePart || "10:00"} ${t.endsWith('AM') ? 'PM' : 'AM'}`);
                   }}>
                      <Text style={{ fontFamily: 'Space Grotesk', color: colors.primary }} className="text-xs font-bold">{(selectedTime || "10:00 AM").split(' ')[1]}</Text>
                   </TouchableOpacity>
                </View>

                {/* Selection Hand (Visual indicator) */}
                {(() => {
                  const time = selectedTime || "10:00 AM";
                  const val = clockPickerMode === "hour" ? parseInt(time.split(':')[0]) : parseInt(time.split(':')[1].split(' ')[0]);
                  const angle = clockPickerMode === "hour" ? (val % 12) * 30 : val * 6;
                  return (
                    <View 
                      className="absolute w-1 rounded-full" 
                      style={{ 
                        backgroundColor: colors.primaryBgStrong,
                        height: 90, 
                        bottom: '50%', 
                        left: '50%',
                        transform: [
                          { translateX: -0.5 },
                          { translateY: 45 },
                          { rotate: `${angle}deg` },
                          { translateY: -45 }
                        ]
                      }} 
                    />
                  );
                })()}

                {/* Numbers */}
                {(clockPickerMode === "hour" ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]).map((val, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const radius = 100;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  const displayVal = clockPickerMode === "hour" ? val : val.toString().padStart(2, '0');
                  const time = selectedTime || "10:00 AM";
                  const isSelected = clockPickerMode === "hour" 
                    ? time.startsWith(val.toString().padStart(2, '0')) || (val === 12 && time.startsWith("12"))
                    : time.split(' ')[0].endsWith(displayVal);

                  return (
                    <TouchableOpacity 
                      key={val}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (clockPickerMode === "hour") {
                          const t = selectedTime || "10:00 AM";
                          const [timeStr, ampm] = t.split(' ');
                          const [, m] = (timeStr || "10:00").split(':');
                          onSelectTime(`${val.toString().padStart(2, '0')}:${m || "00"} ${ampm || "AM"}`);
                          setTimeout(() => setClockPickerMode("minute"), 200);
                        } else {
                          const t = selectedTime || "10:00 AM";
                          const [timeStr, ampm] = t.split(' ');
                          const [h] = (timeStr || "10:00").split(':');
                          onSelectTime(`${h || "10"}:${displayVal} ${ampm || "AM"}`);
                        }
                      }}
                      className={`absolute w-10 h-10 items-center justify-center rounded-full ${isSelected ? 'border-2' : ''}`}
                      style={{ 
                        backgroundColor: isSelected ? colors.primary : colors.bgInput,
                        borderColor: isSelected ? colors.borderLight : 'transparent',
                        transform: [{ translateX: x }, { translateY: y }],
                        shadowColor: isSelected ? colors.primary : 'transparent',
                        shadowOpacity: 0.5,
                        shadowRadius: 10
                      }}
                    >
                      <Text style={{ fontFamily: 'Space Grotesk', color: isSelected ? colors.bgPrimary : colors.textMuted }} className="text-xs font-bold">
                        {displayVal}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
             </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CustomClockPicker;
