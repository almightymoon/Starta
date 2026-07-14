import bpy
import math
from mathutils import Vector

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

bpy.ops.import_scene.gltf(filepath='/Users/moon/Documents/Codex/2026-07-14/withe/outputs/strata/assets/curved-roof-house.glb')
objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']

# Centre the imported model on the origin and derive a reliable camera distance.
corners = [obj.matrix_world @ Vector(corner) for obj in objects for corner in obj.bound_box]
min_v = Vector((min(v.x for v in corners), min(v.y for v in corners), min(v.z for v in corners)))
max_v = Vector((max(v.x for v in corners), max(v.y for v in corners), max(v.z for v in corners)))
centre = (min_v + max_v) / 2
size = max(max_v.x-min_v.x, max_v.y-min_v.y, max_v.z-min_v.z)
for obj in objects:
    obj.location -= centre

world = bpy.context.scene.world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.61, 0.64, 0.60, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.42

floor = bpy.data.meshes.new('Studio floor')
floor_obj = bpy.data.objects.new('Studio floor', floor)
bpy.context.collection.objects.link(floor_obj)
bpy.ops.mesh.primitive_plane_add(size=size * 12, location=(0, 0, -size * .52))
plane = bpy.context.object
mat = bpy.data.materials.new('Warm sage floor')
mat.diffuse_color = (0.61, 0.64, 0.60, 1)
plane.data.materials.append(mat)

def look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()

bpy.ops.object.camera_add(location=(size * 1.8, -size * 2.25, size * 1.18))
camera = bpy.context.object
camera.data.lens = 53
look_at(camera, (0, 0, 0))
bpy.context.scene.camera = camera

def area(name, location, energy, scale, color):
    bpy.ops.object.light_add(type='AREA', location=location)
    lamp = bpy.context.object
    lamp.name = name
    lamp.data.energy = energy
    lamp.data.shape = 'DISK'
    lamp.data.size = scale
    lamp.data.color = color
    look_at(lamp, (0, 0, 0))

area('Key', (size * 1.2, -size * 1.5, size * 2.4), 1050, size * 2.8, (1.0, .82, .64))
area('Fill', (-size * 1.7, -size, size * .9), 760, size * 2.2, (.67, .79, 1.0))
area('Rim', (size * .5, size * 1.8, size * 2), 1300, size * 2.5, (1.0, .9, .75))

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1600
scene.render.resolution_y = 1100
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.quality = 92
scene.render.film_transparent = False
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.render.filepath = '/Users/moon/Documents/Codex/2026-07-14/withe/outputs/strata/assets/curved-roof-house-render.webp'
bpy.ops.wm.save_as_mainfile(filepath='/Users/moon/Documents/Codex/2026-07-14/withe/work/curved-roof-house-scene.blend')
bpy.ops.render.render(write_still=True)
