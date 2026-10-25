"""Run with Blender --background --disable-autoexec --python this.py -- source.blend output.glb."""
import bpy
import json
import sys

source, output = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.open_mainfile(filepath=source)
mesh = bpy.data.objects.get('Anxious Dog - clean triangular network')
assert mesh and mesh.type == 'MESH', 'Expected the supplied low-poly dog network'
rig = mesh.parent
assert rig and rig.type == 'ARMATURE'
for obj in list(bpy.data.objects):
    if obj not in (mesh, rig):
        bpy.data.objects.remove(obj, do_unlink=True)

# The browser draws the skinned mesh edges directly; thick wire tubes and vertex lamps are unnecessary.
for modifier in list(mesh.modifiers):
    if modifier.type != 'ARMATURE':
        mesh.modifiers.remove(modifier)
for obj in bpy.data.objects:
    obj.select_set(False)
for obj in (mesh, rig):
    obj.hide_set(False)
    obj.hide_viewport = False
    obj.hide_render = False
    obj.select_set(True)
bpy.context.view_layer.objects.active = rig

clips = {'0000': 'Idle', '0200': 'Walk', 'grabA': 'Catch'}
for action in list(bpy.data.actions):
    suffix = action.name.rsplit('|', 1)[-1]
    if suffix in clips:
        action.name = clips[suffix]
    else:
        bpy.data.actions.remove(action)
rig.animation_data.action = bpy.data.actions['Idle']
bpy.context.scene.frame_set(1)

properties = bpy.ops.export_scene.gltf.get_rna_type().properties
def enum_value(name, requested):
    values = [value.identifier for value in properties[name].enum_items]
    if not values:
        # Some Blender enums are contextual and expose values only in validation errors.
        try:
            bpy.ops.export_scene.gltf(**{name: '__inspect_valid_values__'})
        except TypeError as error:
            assert repr(requested) in str(error), (name, str(error))
            return requested
    assert requested in values, (name, values)
    return requested

options = dict(filepath=output, use_selection=True, export_format=enum_value('export_format', 'GLB'),
               export_skins=True, export_animations=True,
               export_animation_mode=enum_value('export_animation_mode', 'ACTIONS'),
               export_materials=enum_value('export_materials', 'NONE'))
if 'export_force_sampling' in properties:
    options['export_force_sampling'] = True
bpy.ops.export_scene.gltf(**options)
print('CHASER_EXPORT', json.dumps({'vertices': len(mesh.data.vertices), 'bones': len(rig.data.bones),
                                'actions': [(a.name, list(a.frame_range)) for a in bpy.data.actions], 'output': output}))
