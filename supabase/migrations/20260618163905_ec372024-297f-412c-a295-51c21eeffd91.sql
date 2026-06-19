INSERT INTO public.user_roles (user_id, role)
VALUES ('fab269a7-4236-4373-ab7c-51c91752641c', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;